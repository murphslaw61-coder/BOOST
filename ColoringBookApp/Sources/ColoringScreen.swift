import SwiftUI
import UIKit

/// State for the page currently being colored.
@MainActor
final class ColoringSession: ObservableObject {
    let page: Page
    private let store: PageStore

    @Published private(set) var engine: ColoringEngine?
    @Published private(set) var failedToLoad = false
    @Published private(set) var canUndo = false
    @Published private(set) var canRedo = false
    @Published private(set) var revision = 0
    @Published var tool = ToolSettings()

    private var hasUnsavedChanges = false

    init(page: Page, store: PageStore) {
        self.page = page
        self.store = store
    }

    func load() {
        guard engine == nil, !failedToLoad else { return }
        guard let art = store.lineArt(for: page), let engine = ColoringEngine(lineArt: art) else {
            failedToLoad = true
            return
        }
        if let progress = store.progress(for: page) { engine.load(progress: progress) }
        self.engine = engine
        updateFlags()
    }

    func didChange() {
        hasUnsavedChanges = true
        updateFlags()
    }

    func undo() { engine?.undo(); historyChanged() }
    func redo() { engine?.redo(); historyChanged() }
    func startOver() { engine?.clear(); historyChanged() }

    func save() {
        guard hasUnsavedChanges, let png = engine?.progressPNG() else { return }
        store.saveProgress(png, for: page)
        hasUnsavedChanges = false
    }

    func finishedImage() -> UIImage? { engine?.compositeImage() }

    private func historyChanged() {
        revision += 1
        didChange()
    }

    private func updateFlags() {
        canUndo = engine?.canUndo ?? false
        canRedo = engine?.canRedo ?? false
    }
}

struct ShareItem: Identifiable {
    let id = UUID()
    let image: UIImage
}

struct ColoringScreen: View {
    @StateObject private var session: ColoringSession
    @Environment(\.scenePhase) private var scenePhase
    @State private var shareItem: ShareItem?
    @State private var confirmStartOver = false

    init(page: Page, store: PageStore) {
        _session = StateObject(wrappedValue: ColoringSession(page: page, store: store))
    }

    var body: some View {
        VStack(spacing: 0) {
            Group {
                if let engine = session.engine {
                    ColoringCanvas(engine: engine, tool: session.tool, revision: session.revision) {
                        session.didChange()
                    }
                } else if session.failedToLoad {
                    ContentUnavailableView("Couldn't open this page", systemImage: "exclamationmark.triangle")
                } else {
                    ProgressView("Preparing page…")
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color(.secondarySystemBackground))

            Divider()
            ToolPanel(tool: $session.tool)
        }
        .navigationTitle(session.page.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItemGroup(placement: .topBarTrailing) {
                Button { session.undo() } label: { Image(systemName: "arrow.uturn.backward") }
                    .disabled(!session.canUndo)
                    .accessibilityLabel("Undo")
                Button { session.redo() } label: { Image(systemName: "arrow.uturn.forward") }
                    .disabled(!session.canRedo)
                    .accessibilityLabel("Redo")
                Menu {
                    Button("Share or Save…", systemImage: "square.and.arrow.up") {
                        if let image = session.finishedImage() { shareItem = ShareItem(image: image) }
                    }
                    Button("Start Over", systemImage: "arrow.counterclockwise", role: .destructive) {
                        confirmStartOver = true
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
                .disabled(session.engine == nil)
            }
        }
        .confirmationDialog("Clear all color from this page?", isPresented: $confirmStartOver,
                            titleVisibility: .visible) {
            Button("Start Over", role: .destructive) { session.startOver() }
        } message: {
            Text("You can still undo this.")
        }
        .sheet(item: $shareItem) { item in
            ActivityView(items: [item.image])
                .ignoresSafeArea()
        }
        .task {
            // Let the "Preparing page" spinner appear before the page is processed.
            try? await Task.sleep(nanoseconds: 60_000_000)
            session.load()
        }
        .onDisappear { session.save() }
        .onChange(of: scenePhase) { _, phase in
            if phase != .active { session.save() }
        }
    }
}

/// The standard iOS share sheet (Messages, Save Image, Instagram, Print and so on).
struct ActivityView: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ controller: UIActivityViewController, context: Context) {}
}

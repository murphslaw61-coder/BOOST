import SwiftUI
import PhotosUI

/// The home screen: a grid of pages, plus a button to add your own artwork.
struct LibraryView: View {
    @EnvironmentObject private var store: PageStore
    @State private var pickerItem: PhotosPickerItem?
    @State private var showImportError = false

    private let columns = [GridItem(.adaptive(minimum: 150), spacing: 16)]

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVGrid(columns: columns, spacing: 20) {
                    ForEach(store.pages) { page in
                        NavigationLink(value: page) {
                            PageCard(page: page)
                        }
                        .buttonStyle(.plain)
                        .contextMenu {
                            Button("Start Over", systemImage: "arrow.counterclockwise") {
                                store.resetProgress(for: page)
                            }
                            if !page.isBuiltIn {
                                Button("Delete Page", systemImage: "trash", role: .destructive) {
                                    store.delete(page)
                                }
                            }
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Coloring Book")
            .navigationDestination(for: Page.self) { page in
                ColoringScreen(page: page, store: store)
            }
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    PhotosPicker(selection: $pickerItem, matching: .images) {
                        Label("Add Page", systemImage: "plus")
                    }
                }
            }
            .onChange(of: pickerItem) { _, item in
                guard let item else { return }
                Task {
                    let data = try? await item.loadTransferable(type: Data.self)
                    let added = data.map { store.importPage(imageData: $0) } ?? false
                    if !added { showImportError = true }
                    pickerItem = nil
                }
            }
            .alert("Couldn't add that image", isPresented: $showImportError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text("Try another photo, or a PNG or JPEG of black line art on a white background.")
            }
        }
    }
}

struct PageCard: View {
    @EnvironmentObject private var store: PageStore
    let page: Page

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack {
                Color.white
                if let thumb = store.thumbnail(for: page) {
                    Image(uiImage: thumb)
                        .resizable()
                        .scaledToFit()
                }
            }
            .aspectRatio(1, contentMode: .fit)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.primary.opacity(0.12)))
            .id(store.thumbnailRevision)

            Text(page.title)
                .font(.subheadline.weight(.medium))
                .lineLimit(1)
        }
    }
}

import UIKit

struct Page: Identifiable, Hashable, Codable {
    let id: String
    var title: String
    var isBuiltIn: Bool
}

/// Keeps the list of pages and saves everything in the app's Documents folder:
/// imported line art, coloring progress, and the list of imported pages.
@MainActor
final class PageStore: ObservableObject {
    @Published private(set) var pages: [Page] = []
    @Published private(set) var thumbnailRevision = 0

    private var importedPages: [Page] = []
    private var thumbnailCache: [String: UIImage] = [:]
    private let root: URL

    init() {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        root = docs.appendingPathComponent("ColoringBook", isDirectory: true)
        for dir in [pagesDir, progressDir] {
            try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        }
        importedPages = loadIndex()
        rebuild()
    }

    // MARK: Files

    private var pagesDir: URL { root.appendingPathComponent("Pages", isDirectory: true) }
    private var progressDir: URL { root.appendingPathComponent("Progress", isDirectory: true) }
    private var indexURL: URL { root.appendingPathComponent("imported.json") }
    private func pageURL(_ page: Page) -> URL { pagesDir.appendingPathComponent("\(page.id).png") }
    private func progressURL(_ page: Page) -> URL { progressDir.appendingPathComponent("\(page.id).png") }

    private func rebuild() {
        pages = LineArtLibrary.pages + importedPages
    }

    private func loadIndex() -> [Page] {
        guard let data = try? Data(contentsOf: indexURL),
              let list = try? JSONDecoder().decode([Page].self, from: data) else { return [] }
        return list
    }

    private func saveIndex() {
        if let data = try? JSONEncoder().encode(importedPages) {
            try? data.write(to: indexURL, options: .atomic)
        }
    }

    // MARK: Pages

    func lineArt(for page: Page) -> UIImage? {
        page.isBuiltIn ? LineArtLibrary.image(for: page.id) : UIImage(contentsOfFile: pageURL(page).path)
    }

    func progress(for page: Page) -> UIImage? {
        UIImage(contentsOfFile: progressURL(page).path)
    }

    func saveProgress(_ png: Data, for page: Page) {
        try? png.write(to: progressURL(page), options: .atomic)
        invalidateThumbnail(page)
    }

    func resetProgress(for page: Page) {
        try? FileManager.default.removeItem(at: progressURL(page))
        invalidateThumbnail(page)
    }

    /// Adds a photo or image of line art (for example, a page from your own coloring book).
    func importPage(imageData: Data) -> Bool {
        guard let image = UIImage(data: imageData),
              let png = Self.downscaled(image, maxSide: 2048).pngData() else { return false }
        let page = Page(id: UUID().uuidString, title: "My Page \(importedPages.count + 1)", isBuiltIn: false)
        do {
            try png.write(to: pageURL(page), options: .atomic)
        } catch {
            return false
        }
        importedPages.append(page)
        saveIndex()
        rebuild()
        return true
    }

    func delete(_ page: Page) {
        guard !page.isBuiltIn else { return }
        try? FileManager.default.removeItem(at: pageURL(page))
        try? FileManager.default.removeItem(at: progressURL(page))
        importedPages.removeAll { $0.id == page.id }
        saveIndex()
        invalidateThumbnail(page)
        rebuild()
    }

    // MARK: Thumbnails

    func thumbnail(for page: Page) -> UIImage? {
        if let cached = thumbnailCache[page.id] { return cached }
        guard let art = lineArt(for: page) else { return nil }
        let colors = progress(for: page)
        let side: CGFloat = 360
        let aspect = art.size.width / max(art.size.height, 1)
        let size = aspect >= 1 ? CGSize(width: side, height: side / aspect) : CGSize(width: side * aspect, height: side)
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true
        let thumb = UIGraphicsImageRenderer(size: size, format: format).image { ctx in
            let rect = CGRect(origin: .zero, size: size)
            UIColor.white.setFill()
            ctx.fill(rect)
            colors?.draw(in: rect)
            art.draw(in: rect, blendMode: .multiply, alpha: 1)
        }
        thumbnailCache[page.id] = thumb
        return thumb
    }

    private func invalidateThumbnail(_ page: Page) {
        thumbnailCache[page.id] = nil
        thumbnailRevision += 1
    }

    private static func downscaled(_ image: UIImage, maxSide: CGFloat) -> UIImage {
        let w = image.size.width * image.scale, h = image.size.height * image.scale
        let s = min(1, maxSide / max(w, h, 1))
        let size = CGSize(width: (w * s).rounded(), height: (h * s).rounded())
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true
        return UIGraphicsImageRenderer(size: size, format: format).image { ctx in
            UIColor.white.setFill()
            ctx.fill(CGRect(origin: .zero, size: size))
            image.draw(in: CGRect(origin: .zero, size: size))
        }
    }
}

import UIKit

/// An opaque color stored as 8-bit red, green and blue.
struct RGBA: Equatable, Hashable {
    var r: UInt8
    var g: UInt8
    var b: UInt8

    static let white = RGBA(r: 255, g: 255, b: 255)

    static func mix(_ a: RGBA, _ b: RGBA, _ t: Double) -> RGBA {
        func m(_ x: UInt8, _ y: UInt8) -> UInt8 {
            UInt8((Double(x) + (Double(y) - Double(x)) * t).rounded())
        }
        return RGBA(r: m(a.r, b.r), g: m(a.g, b.g), b: m(a.b, b.b))
    }
}

enum BrushKind: String, CaseIterable, Identifiable {
    case marker, pencil, airbrush, eraser
    var id: String { rawValue }
}

struct BrushStroke {
    var kind: BrushKind
    var size: CGFloat
    var color: RGBA
    var stayInsideLines: Bool
}

/// Holds one page being colored: the line art, the color layer underneath it,
/// the enclosed areas used by tap-to-fill, and the undo history.
///
/// Coordinates are in pixels, with (0, 0) at the top-left of the page.
final class ColoringEngine {
    /// Largest side of the working image. Raise for more detail, lower for speed.
    static let defaultMaxSide = 1024
    /// Pixels darker than this count as "line" and stop fills.
    private static let lineThreshold: UInt8 = 140
    private static let maxUndo = 15

    let width: Int
    let height: Int
    /// Black lines on a transparent background, drawn on top of the colors.
    let lineArtOverlay: CGImage

    private var pixels: [UInt8]          // RGBA, always opaque
    private let labels: [Int32]          // area number per pixel; -1 = line
    private let regions: [RegionBounds]  // bounding box per area number

    private var undoStack: [[UInt8]] = []
    private var redoStack: [[UInt8]] = []

    private var stroke: BrushStroke?
    private var strokeRegion: Int32?
    private var lastPoint: CGPoint = .zero
    private var lastPressure: CGFloat = 0.65

    var canUndo: Bool { !undoStack.isEmpty }
    var canRedo: Bool { !redoStack.isEmpty }

    private struct RegionBounds {
        var minX: Int, minY: Int, maxX: Int, maxY: Int
    }

    // MARK: - Setup

    init?(lineArt: UIImage, maxSide: Int = ColoringEngine.defaultMaxSide) {
        let pxW = lineArt.size.width * lineArt.scale
        let pxH = lineArt.size.height * lineArt.scale
        guard pxW > 0, pxH > 0 else { return nil }
        let s = min(1, CGFloat(maxSide) / max(pxW, pxH))
        let w = max(1, Int((pxW * s).rounded()))
        let h = max(1, Int((pxH * s).rounded()))

        // Flatten onto white (handles transparent PNGs and photo orientation).
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true
        let flat = UIGraphicsImageRenderer(size: CGSize(width: w, height: h), format: format).image { ctx in
            UIColor.white.setFill()
            ctx.fill(CGRect(x: 0, y: 0, width: w, height: h))
            lineArt.draw(in: CGRect(x: 0, y: 0, width: w, height: h))
        }
        guard let flatCG = flat.cgImage else { return nil }

        var gray = [UInt8](repeating: 255, count: w * h)
        let drew = gray.withUnsafeMutableBytes { buf -> Bool in
            guard let ctx = CGContext(data: buf.baseAddress, width: w, height: h,
                                      bitsPerComponent: 8, bytesPerRow: w,
                                      space: CGColorSpaceCreateDeviceGray(),
                                      bitmapInfo: CGImageAlphaInfo.none.rawValue) else { return false }
            ctx.draw(flatCG, in: CGRect(x: 0, y: 0, width: w, height: h))
            return true
        }
        guard drew, let overlay = ColoringEngine.makeOverlay(gray: gray, width: w, height: h) else { return nil }

        let (labels, regions) = ColoringEngine.labelRegions(gray: gray, width: w, height: h)
        self.width = w
        self.height = h
        self.labels = labels
        self.regions = regions
        self.lineArtOverlay = overlay
        self.pixels = [UInt8](repeating: 255, count: w * h * 4)
    }

    /// Restores a previously saved color layer.
    func load(progress: UIImage) {
        guard let cg = progress.cgImage else { return }
        let w = width, h = height
        pixels.withUnsafeMutableBytes { buf in
            guard let ctx = CGContext(data: buf.baseAddress, width: w, height: h,
                                      bitsPerComponent: 8, bytesPerRow: w * 4,
                                      space: CGColorSpaceCreateDeviceRGB(),
                                      bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else { return }
            ctx.interpolationQuality = .none
            ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
        }
    }

    /// Splits the page into enclosed areas (connected non-line pixels).
    private static func labelRegions(gray: [UInt8], width w: Int, height h: Int) -> ([Int32], [RegionBounds]) {
        let n = w * h
        var labels = [Int32](repeating: -2, count: n)   // -2 = not visited yet
        var regions: [RegionBounds] = []
        var stack: [Int] = []
        stack.reserveCapacity(4096)

        labels.withUnsafeMutableBufferPointer { lab in
            gray.withUnsafeBufferPointer { g in
                for i in 0..<n where g[i] < lineThreshold { lab[i] = -1 }
                var next: Int32 = 0
                for start in 0..<n where lab[start] == -2 {
                    lab[start] = next
                    stack.append(start)
                    var b = RegionBounds(minX: w, minY: h, maxX: 0, maxY: 0)
                    while let p = stack.popLast() {
                        let x = p % w, y = p / w
                        if x < b.minX { b.minX = x }
                        if x > b.maxX { b.maxX = x }
                        if y < b.minY { b.minY = y }
                        if y > b.maxY { b.maxY = y }
                        if x > 0, lab[p - 1] == -2 { lab[p - 1] = next; stack.append(p - 1) }
                        if x < w - 1, lab[p + 1] == -2 { lab[p + 1] = next; stack.append(p + 1) }
                        if y > 0, lab[p - w] == -2 { lab[p - w] = next; stack.append(p - w) }
                        if y < h - 1, lab[p + w] == -2 { lab[p + w] = next; stack.append(p + w) }
                    }
                    regions.append(b)
                    next += 1
                }
            }
        }
        return (labels, regions)
    }

    private static func makeOverlay(gray: [UInt8], width w: Int, height h: Int) -> CGImage? {
        var rgba = [UInt8](repeating: 0, count: w * h * 4)
        rgba.withUnsafeMutableBufferPointer { out in
            gray.withUnsafeBufferPointer { g in
                for i in 0..<(w * h) {
                    let v = Int(g[i])
                    // Black, premultiplied: only alpha is non-zero. Light paper becomes transparent.
                    out[i * 4 + 3] = v >= 230 ? 0 : UInt8(min(255, (230 - v) * 255 / 180))
                }
            }
        }
        return makeImage(from: rgba, width: w, height: h, alphaInfo: .premultipliedLast)
    }

    private static func makeImage(from bytes: [UInt8], width w: Int, height h: Int,
                                  alphaInfo: CGImageAlphaInfo) -> CGImage? {
        guard let provider = CGDataProvider(data: Data(bytes) as CFData) else { return nil }
        return CGImage(width: w, height: h, bitsPerComponent: 8, bitsPerPixel: 32,
                       bytesPerRow: w * 4, space: CGColorSpaceCreateDeviceRGB(),
                       bitmapInfo: CGBitmapInfo(rawValue: alphaInfo.rawValue),
                       provider: provider, decode: nil, shouldInterpolate: true,
                       intent: .defaultIntent)
    }

    // MARK: - Output

    func colorImage() -> CGImage? {
        ColoringEngine.makeImage(from: pixels, width: width, height: height, alphaInfo: .noneSkipLast)
    }

    /// The color layer only, for saving progress.
    func progressPNG() -> Data? {
        guard let cg = colorImage() else { return nil }
        return UIImage(cgImage: cg).pngData()
    }

    /// Colors plus line art: the finished picture to share.
    func compositeImage() -> UIImage? {
        guard let color = colorImage() else { return nil }
        let size = CGSize(width: width, height: height)
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true
        return UIGraphicsImageRenderer(size: size, format: format).image { _ in
            UIImage(cgImage: color).draw(in: CGRect(origin: .zero, size: size))
            UIImage(cgImage: lineArtOverlay).draw(in: CGRect(origin: .zero, size: size))
        }
    }

    // MARK: - Tap to fill

    /// Fills the enclosed area under `point`. Returns false if nothing was filled.
    @discardableResult
    func fill(at point: CGPoint, color: RGBA, gradientTo: RGBA?) -> Bool {
        guard let region = region(near: point) else { return false }
        pushUndo()
        let b = regions[Int(region)]
        let w = width, h = height
        let x0 = max(0, b.minX - 1), x1 = min(w - 1, b.maxX + 1)
        let y0 = max(0, b.minY - 1), y1 = min(h - 1, b.maxY + 1)
        let spanY = Double(max(1, b.maxY - b.minY))

        labels.withUnsafeBufferPointer { lab in
            pixels.withUnsafeMutableBufferPointer { px in
                for y in y0...y1 {
                    let c: RGBA
                    if let end = gradientTo {
                        c = RGBA.mix(color, end, min(1, max(0, Double(y - b.minY) / spanY)))
                    } else {
                        c = color
                    }
                    for x in x0...x1 {
                        let i = y * w + x
                        let l = lab[i]
                        var paint = l == region
                        if !paint && l == -1 {
                            // Color the edge of the line too, so no white halo shows.
                            paint = (x > 0 && lab[i - 1] == region) || (x < w - 1 && lab[i + 1] == region)
                                || (y > 0 && lab[i - w] == region) || (y < h - 1 && lab[i + w] == region)
                        }
                        if paint {
                            let o = i * 4
                            px[o] = c.r; px[o + 1] = c.g; px[o + 2] = c.b
                        }
                    }
                }
            }
        }
        return true
    }

    /// The area at `point`, or the closest one if the user tapped on a line.
    private func region(near point: CGPoint) -> Int32? {
        let cx = Int(point.x), cy = Int(point.y)
        guard cx >= 0, cy >= 0, cx < width, cy < height else { return nil }
        for r in 0...6 {
            for dy in -r...r {
                for dx in -r...r where abs(dx) == r || abs(dy) == r {
                    let x = cx + dx, y = cy + dy
                    guard x >= 0, y >= 0, x < width, y < height else { continue }
                    let l = labels[y * width + x]
                    if l >= 0 { return l }
                }
            }
        }
        return nil
    }

    // MARK: - Brushes

    func beginStroke(at point: CGPoint, pressure: CGFloat, brush: BrushStroke) {
        pushUndo()
        stroke = brush
        strokeRegion = brush.stayInsideLines ? region(near: point) : nil
        lastPoint = point
        lastPressure = pressure
        stamp(at: point, pressure: pressure)
    }

    func continueStroke(to point: CGPoint, pressure: CGFloat) {
        guard let brush = stroke else { return }
        let radius = max(1, brush.size / 2)
        let spacing = max(1, radius * spacingFactor(brush.kind))
        let start = lastPoint, startPressure = lastPressure
        let dx = point.x - start.x, dy = point.y - start.y
        let dist = hypot(dx, dy)
        guard dist >= spacing else { return }

        var traveled = spacing
        while traveled <= dist {
            let t = traveled / dist
            stamp(at: CGPoint(x: start.x + dx * t, y: start.y + dy * t),
                  pressure: startPressure + (pressure - startPressure) * t)
            traveled += spacing
        }
        let t = (traveled - spacing) / dist
        lastPoint = CGPoint(x: start.x + dx * t, y: start.y + dy * t)
        lastPressure = startPressure + (pressure - startPressure) * t
    }

    func endStroke() {
        stroke = nil
        strokeRegion = nil
    }

    /// Throws away the stroke in progress (e.g. when a pinch-to-zoom starts).
    func cancelStroke() {
        guard stroke != nil else { return }
        stroke = nil
        strokeRegion = nil
        if let previous = undoStack.popLast() { pixels = previous }
    }

    private func spacingFactor(_ kind: BrushKind) -> CGFloat {
        switch kind {
        case .marker, .eraser: return 0.15
        case .pencil: return 0.3
        case .airbrush: return 0.2
        }
    }

    private func stamp(at center: CGPoint, pressure: CGFloat) {
        guard let brush = stroke else { return }
        let p = min(max(pressure, 0), 1)
        let radius = max(0.75, brush.size / 2 * (0.35 + p))   // finger (0.65) = full size
        let color = brush.kind == .eraser ? RGBA.white : brush.color
        let kind = brush.kind
        let baseAlpha: Double
        switch kind {
        case .marker, .eraser: baseAlpha = 1
        case .pencil: baseAlpha = 0.12 + 0.25 * Double(p)
        case .airbrush: baseAlpha = 0.05 + 0.06 * Double(p)
        }

        let minX = max(0, Int(floor(center.x - radius))), maxX = min(width - 1, Int(ceil(center.x + radius)))
        let minY = max(0, Int(floor(center.y - radius))), maxY = min(height - 1, Int(ceil(center.y + radius)))
        guard minX <= maxX, minY <= maxY else { return }

        let w = width, clip = strokeRegion
        let r = Double(radius), cx = Double(center.x), cy = Double(center.y)

        labels.withUnsafeBufferPointer { lab in
            pixels.withUnsafeMutableBufferPointer { px in
                for y in minY...maxY {
                    for x in minX...maxX {
                        let i = y * w + x
                        if let clip, lab[i] != clip && lab[i] != -1 { continue }
                        let ddx = Double(x) + 0.5 - cx, ddy = Double(y) + 0.5 - cy
                        let d = (ddx * ddx + ddy * ddy).squareRoot()
                        guard d <= r + 0.5 else { continue }
                        let edge = min(1, r + 0.5 - d)
                        var a: Double
                        switch kind {
                        case .marker, .eraser:
                            a = edge
                        case .pencil:
                            a = baseAlpha * ColoringEngine.grain(x, y) * edge
                        case .airbrush:
                            let f = max(0, 1 - d / r)
                            a = baseAlpha * f * f
                        }
                        guard a > 0 else { continue }
                        a = min(a, 1)
                        let o = i * 4
                        px[o] = ColoringEngine.blend(px[o], color.r, a)
                        px[o + 1] = ColoringEngine.blend(px[o + 1], color.g, a)
                        px[o + 2] = ColoringEngine.blend(px[o + 2], color.b, a)
                    }
                }
            }
        }
    }

    private static func blend(_ dst: UInt8, _ src: UInt8, _ a: Double) -> UInt8 {
        UInt8((Double(dst) * (1 - a) + Double(src) * a).rounded())
    }

    /// Fixed "paper grain" so pencil strokes look textured.
    private static func grain(_ x: Int, _ y: Int) -> Double {
        var h = UInt32(truncatingIfNeeded: x &* 374_761_393 &+ y &* 668_265_263)
        h = (h ^ (h >> 13)) &* 1_274_126_177
        h ^= h >> 16
        return 0.25 + 0.75 * Double(h & 0xFF) / 255
    }

    // MARK: - History

    private func pushUndo() {
        undoStack.append(pixels)
        if undoStack.count > ColoringEngine.maxUndo { undoStack.removeFirst() }
        redoStack.removeAll()
    }

    func undo() {
        guard let previous = undoStack.popLast() else { return }
        redoStack.append(pixels)
        pixels = previous
    }

    func redo() {
        guard let next = redoStack.popLast() else { return }
        undoStack.append(pixels)
        pixels = next
    }

    func clear() {
        pushUndo()
        pixels = [UInt8](repeating: 255, count: width * height * 4)
    }
}

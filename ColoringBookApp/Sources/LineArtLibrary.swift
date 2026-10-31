import UIKit

/// Starter pages drawn in code, so the app works before you add your own artwork.
/// Replace or extend these with pages from your own coloring books.
@MainActor
enum LineArtLibrary {
    static let pages: [Page] = [
        Page(id: "builtin.mandala", title: "Mandala", isBuiltIn: true),
        Page(id: "builtin.garden", title: "Garden", isBuiltIn: true),
        Page(id: "builtin.balloon", title: "Hot Air Balloon", isBuiltIn: true),
        Page(id: "builtin.coffee", title: "Coffee Break", isBuiltIn: true),
        Page(id: "builtin.tiles", title: "Tiles", isBuiltIn: true),
    ]

    private static var cache: [String: UIImage] = [:]
    private static let size: CGFloat = 1024

    static func image(for id: String) -> UIImage? {
        if let cached = cache[id] { return cached }
        guard pages.contains(where: { $0.id == id }) else { return nil }
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true
        let image = UIGraphicsImageRenderer(size: CGSize(width: size, height: size), format: format).image { ctx in
            UIColor.white.setFill()
            ctx.fill(CGRect(x: 0, y: 0, width: size, height: size))
            UIColor.black.setStroke()
            switch id {
            case "builtin.mandala": drawMandala()
            case "builtin.garden": drawGarden()
            case "builtin.balloon": drawBalloon()
            case "builtin.coffee": drawCoffee()
            default: drawTiles()
            }
            UIColor.black.setStroke()
            stroke(UIBezierPath(rect: CGRect(x: 20, y: 20, width: size - 40, height: size - 40)), width: 6)
        }
        cache[id] = image
        return image
    }

    // MARK: Drawing helpers

    private static func p(_ x: CGFloat, _ y: CGFloat) -> CGPoint { CGPoint(x: x, y: y) }

    private static func stroke(_ path: UIBezierPath, width: CGFloat = 5) {
        path.lineWidth = width
        path.lineJoinStyle = .round
        path.lineCapStyle = .round
        path.stroke()
    }

    private static func circle(_ c: CGPoint, _ r: CGFloat) {
        stroke(UIBezierPath(ovalIn: CGRect(x: c.x - r, y: c.y - r, width: 2 * r, height: 2 * r)))
    }

    private static func line(_ a: CGPoint, _ b: CGPoint) {
        let path = UIBezierPath()
        path.move(to: a)
        path.addLine(to: b)
        stroke(path)
    }

    private static func petals(center c: CGPoint, count: Int, inner: CGFloat, outer: CGFloat,
                               width: CGFloat, offset: CGFloat = 0) {
        for i in 0..<count {
            let angle = offset + CGFloat(i) / CGFloat(count) * 2 * .pi
            let path = UIBezierPath(ovalIn: CGRect(x: inner, y: -width / 2, width: outer - inner, height: width))
            path.apply(CGAffineTransform(rotationAngle: angle))
            path.apply(CGAffineTransform(translationX: c.x, y: c.y))
            stroke(path)
        }
    }

    private static func cloud(at c: CGPoint) {
        circle(p(c.x - 60, c.y + 10), 45)
        circle(p(c.x, c.y - 15), 60)
        circle(p(c.x + 65, c.y + 10), 45)
    }

    private static func leaf(center c: CGPoint, angle: CGFloat) {
        let path = UIBezierPath(ovalIn: CGRect(x: -85, y: -30, width: 170, height: 60))
        path.move(to: p(-85, 0))
        path.addLine(to: p(85, 0))
        path.apply(CGAffineTransform(rotationAngle: angle))
        path.apply(CGAffineTransform(translationX: c.x, y: c.y))
        stroke(path)
    }

    private static func heart(center c: CGPoint, scale s: CGFloat) {
        let path = UIBezierPath()
        path.move(to: p(c.x, c.y + 60 * s))
        path.addCurve(to: p(c.x - 70 * s, c.y - 15 * s),
                      controlPoint1: p(c.x - 30 * s, c.y + 35 * s),
                      controlPoint2: p(c.x - 70 * s, c.y + 15 * s))
        path.addArc(withCenter: p(c.x - 35 * s, c.y - 15 * s), radius: 35 * s,
                    startAngle: .pi, endAngle: 0, clockwise: true)
        path.addArc(withCenter: p(c.x + 35 * s, c.y - 15 * s), radius: 35 * s,
                    startAngle: .pi, endAngle: 0, clockwise: true)
        path.addCurve(to: p(c.x, c.y + 60 * s),
                      controlPoint1: p(c.x + 70 * s, c.y + 15 * s),
                      controlPoint2: p(c.x + 30 * s, c.y + 35 * s))
        path.close()
        stroke(path)
    }

    // MARK: Pages

    private static func drawMandala() {
        let c = p(size / 2, size / 2)
        for r: CGFloat in [60, 120, 200, 290, 380, 460] { circle(c, r) }
        petals(center: c, count: 8, inner: 60, outer: 200, width: 80)
        petals(center: c, count: 16, inner: 200, outer: 380, width: 70)
        petals(center: c, count: 32, inner: 380, outer: 460, width: 40)
        for corner in [p(20, 20), p(size - 20, 20), p(20, size - 20), p(size - 20, size - 20)] {
            circle(corner, 90)
            circle(corner, 150)
        }
    }

    private static func drawGarden() {
        // Sun
        let sun = p(190, 190)
        circle(sun, 70)
        for i in 0..<12 {
            let a = CGFloat(i) / 12 * 2 * .pi
            line(p(sun.x + cos(a) * 95, sun.y + sin(a) * 95), p(sun.x + cos(a) * 140, sun.y + sin(a) * 140))
        }
        cloud(at: p(780, 170))

        // Stem and leaves
        let left = UIBezierPath()
        left.move(to: p(500, 560))
        left.addCurve(to: p(490, 900), controlPoint1: p(470, 680), controlPoint2: p(520, 800))
        stroke(left)
        let right = UIBezierPath()
        right.move(to: p(526, 560))
        right.addCurve(to: p(516, 900), controlPoint1: p(496, 680), controlPoint2: p(546, 800))
        stroke(right)
        leaf(center: p(410, 770), angle: -0.5)
        leaf(center: p(605, 720), angle: 0.5)

        // Flower
        petals(center: p(512, 400), count: 10, inner: 40, outer: 230, width: 120)
        circle(p(512, 400), 70)

        // Ground and small flowers
        let ground = UIBezierPath()
        ground.move(to: p(20, 900))
        ground.addCurve(to: p(512, 890), controlPoint1: p(180, 850), controlPoint2: p(340, 940))
        ground.addCurve(to: p(1004, 880), controlPoint1: p(690, 840), controlPoint2: p(850, 930))
        stroke(ground)
        for x: CGFloat in [140, 320, 700, 880] {
            petals(center: p(x, 955), count: 6, inner: 12, outer: 42, width: 26)
            circle(p(x, 955), 14)
        }
    }

    private static func drawBalloon() {
        cloud(at: p(190, 200))
        cloud(at: p(840, 330))
        cloud(at: p(160, 640))

        let c = p(512, 380)
        let r: CGFloat = 250
        circle(c, r)
        for w in [r * 0.6, r * 1.2] {
            stroke(UIBezierPath(ovalIn: CGRect(x: c.x - w / 2, y: c.y - r, width: w, height: 2 * r)))
        }
        line(p(c.x - r, c.y), p(c.x + r, c.y))
        let band = (r * r - 130 * 130).squareRoot()
        line(p(c.x - band, c.y - 130), p(c.x + band, c.y - 130))

        // Skirt, ropes and basket
        let skirtY = c.y + 235
        let dx = (r * r - 235 * 235).squareRoot()
        let skirt = UIBezierPath()
        skirt.move(to: p(c.x - dx, skirtY))
        skirt.addLine(to: p(c.x - 45, 720))
        skirt.addLine(to: p(c.x + 45, 720))
        skirt.addLine(to: p(c.x + dx, skirtY))
        stroke(skirt)
        line(p(c.x - 45, 720), p(c.x - 38, 800))
        line(p(c.x + 45, 720), p(c.x + 38, 800))
        stroke(UIBezierPath(roundedRect: CGRect(x: c.x - 50, y: 800, width: 100, height: 75), cornerRadius: 8))
        line(p(c.x - 50, 825), p(c.x + 50, 825))

        // Mountains
        let mountains = UIBezierPath()
        mountains.move(to: p(20, 960))
        for pt in [p(160, 860), p(300, 950), p(440, 905), p(600, 940), p(760, 850), p(900, 930), p(1004, 900)] {
            mountains.addLine(to: pt)
        }
        stroke(mountains)
    }

    private static func drawCoffee() {
        // Saucer
        stroke(UIBezierPath(ovalIn: CGRect(x: 180, y: 770, width: 664, height: 150)))
        stroke(UIBezierPath(ovalIn: CGRect(x: 300, y: 800, width: 424, height: 80)))

        // Handle (the cup is painted white over its inner half)
        stroke(UIBezierPath(ovalIn: CGRect(x: 640, y: 500, width: 210, height: 220)))
        stroke(UIBezierPath(ovalIn: CGRect(x: 685, y: 550, width: 120, height: 120)))

        // Cup body
        let bodyFill = UIBezierPath()
        bodyFill.move(to: p(282, 470))
        bodyFill.addLine(to: p(352, 800))
        bodyFill.addQuadCurve(to: p(672, 800), controlPoint: p(512, 860))
        bodyFill.addLine(to: p(742, 470))
        bodyFill.close()
        UIColor.white.setFill()
        bodyFill.fill()
        let body = UIBezierPath()
        body.move(to: p(282, 470))
        body.addLine(to: p(352, 800))
        body.addQuadCurve(to: p(672, 800), controlPoint: p(512, 860))
        body.addLine(to: p(742, 470))
        stroke(body)

        // Rim and coffee
        let rim = UIBezierPath(ovalIn: CGRect(x: 282, y: 425, width: 460, height: 90))
        rim.fill()
        stroke(rim)
        stroke(UIBezierPath(ovalIn: CGRect(x: 322, y: 440, width: 380, height: 60)))
        heart(center: p(512, 640), scale: 1)

        // Steam
        for x: CGFloat in [430, 512, 594] {
            let steam = UIBezierPath()
            steam.move(to: p(x, 400))
            steam.addCurve(to: p(x, 180), controlPoint1: p(x - 50, 330), controlPoint2: p(x + 50, 250))
            stroke(steam, width: 6)
        }
    }

    private static func drawTiles() {
        let origin: CGFloat = 20
        let cell = (size - 40) / 4
        for row in 0..<4 {
            for col in 0..<4 {
                let rect = CGRect(x: origin + CGFloat(col) * cell, y: origin + CGFloat(row) * cell,
                                  width: cell, height: cell)
                let c = p(rect.midX, rect.midY)
                stroke(UIBezierPath(rect: rect))
                if (row + col) % 2 == 0 {
                    let diamond = UIBezierPath()
                    diamond.move(to: p(rect.midX, rect.minY))
                    diamond.addLine(to: p(rect.maxX, rect.midY))
                    diamond.addLine(to: p(rect.midX, rect.maxY))
                    diamond.addLine(to: p(rect.minX, rect.midY))
                    diamond.close()
                    stroke(diamond)
                    circle(c, cell * 0.22)
                    petals(center: c, count: 4, inner: 0, outer: cell * 0.22, width: cell * 0.12, offset: .pi / 4)
                } else {
                    line(p(rect.minX, rect.minY), p(rect.maxX, rect.maxY))
                    line(p(rect.maxX, rect.minY), p(rect.minX, rect.maxY))
                    circle(c, cell * 0.3)
                    circle(c, cell * 0.12)
                }
            }
        }
    }
}

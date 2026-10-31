import SwiftUI
import UIKit

/// SwiftUI wrapper around the zoomable coloring canvas.
struct ColoringCanvas: UIViewRepresentable {
    let engine: ColoringEngine
    var tool: ToolSettings
    /// Bump to force a redraw after undo, redo or start over.
    var revision: Int
    var onChange: () -> Void

    func makeUIView(context: Context) -> ZoomingCanvasScrollView {
        let canvas = ColoringCanvasView(engine: engine)
        canvas.tool = tool
        canvas.onChange = onChange
        canvas.revision = revision
        return ZoomingCanvasScrollView(canvas: canvas)
    }

    func updateUIView(_ view: ZoomingCanvasScrollView, context: Context) {
        view.canvas.tool = tool
        view.canvas.onChange = onChange
        if view.canvas.revision != revision {
            view.canvas.revision = revision
            view.canvas.refresh()
        }
    }
}

/// One finger colors; two fingers pinch to zoom and drag to move around.
final class ZoomingCanvasScrollView: UIScrollView, UIScrollViewDelegate {
    let canvas: ColoringCanvasView
    private var didInitialFit = false

    init(canvas: ColoringCanvasView) {
        self.canvas = canvas
        super.init(frame: .zero)
        addSubview(canvas)
        contentSize = canvas.bounds.size
        delegate = self
        maximumZoomScale = 8
        panGestureRecognizer.minimumNumberOfTouches = 2
        delaysContentTouches = false
        showsHorizontalScrollIndicator = false
        showsVerticalScrollIndicator = false
        backgroundColor = .secondarySystemBackground
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override func layoutSubviews() {
        super.layoutSubviews()
        guard bounds.width > 0, bounds.height > 0 else { return }
        let fit = min(bounds.width / canvas.bounds.width, bounds.height / canvas.bounds.height)
        minimumZoomScale = fit
        if !didInitialFit || zoomScale < fit {
            zoomScale = fit
            didInitialFit = true
        }
        centerContent()
    }

    func viewForZooming(in scrollView: UIScrollView) -> UIView? { canvas }

    func scrollViewDidZoom(_ scrollView: UIScrollView) { centerContent() }

    private func centerContent() {
        let dx = max(0, (bounds.width - contentSize.width) / 2)
        let dy = max(0, (bounds.height - contentSize.height) / 2)
        let inset = UIEdgeInsets(top: dy, left: dx, bottom: dy, right: dx)
        if contentInset != inset { contentInset = inset }
    }
}

/// Shows the page and turns touches into fills and brush strokes.
final class ColoringCanvasView: UIView {
    let engine: ColoringEngine
    var tool = ToolSettings()
    var onChange: (() -> Void)?
    var revision = 0

    private let colorLayer = CALayer()
    private let lineLayer = CALayer()
    private var activeTouch: UITouch?
    private var pendingFill: CGPoint?
    private var isStroking = false

    init(engine: ColoringEngine) {
        self.engine = engine
        super.init(frame: CGRect(x: 0, y: 0, width: engine.width, height: engine.height))
        isMultipleTouchEnabled = true
        backgroundColor = .white
        colorLayer.frame = bounds
        lineLayer.frame = bounds
        lineLayer.contents = engine.lineArtOverlay
        layer.addSublayer(colorLayer)
        layer.addSublayer(lineLayer)
        refresh()
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    func refresh() {
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        colorLayer.contents = engine.colorImage()
        CATransaction.commit()
    }

    private func pressure(of touch: UITouch) -> CGFloat {
        guard touch.type == .pencil, touch.maximumPossibleForce > 0 else { return 0.65 }
        return touch.force / touch.maximumPossibleForce
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        // A second finger means the user is pinching or panning, not coloring.
        if activeTouch != nil || (event?.allTouches?.count ?? 1) > 1 {
            cancelActive()
            return
        }
        guard let touch = touches.first else { return }
        activeTouch = touch
        let point = touch.location(in: self)
        switch tool.mode {
        case .fill:
            pendingFill = point
        case .brush:
            isStroking = true
            engine.beginStroke(at: point, pressure: pressure(of: touch), brush: tool.brushStroke)
            refresh()
        }
    }

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = activeTouch, touches.contains(touch) else { return }
        if let start = pendingFill {
            let p = touch.location(in: self)
            if hypot(p.x - start.x, p.y - start.y) > 12 { pendingFill = nil }   // a drag, not a tap
        }
        guard isStroking else { return }
        let samples = event?.coalescedTouches(for: touch) ?? [touch]
        for sample in samples {
            engine.continueStroke(to: sample.location(in: self), pressure: pressure(of: sample))
        }
        refresh()
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = activeTouch, touches.contains(touch) else { return }
        activeTouch = nil
        if let point = pendingFill {
            pendingFill = nil
            let gradient = tool.gradient ? tool.gradientColor : nil
            if engine.fill(at: point, color: tool.color, gradientTo: gradient) {
                refresh()
                onChange?()
            }
        }
        if isStroking {
            isStroking = false
            engine.endStroke()
            onChange?()
        }
    }

    override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
        cancelActive()
    }

    private func cancelActive() {
        activeTouch = nil
        pendingFill = nil
        if isStroking {
            isStroking = false
            engine.cancelStroke()
            refresh()
        }
    }
}

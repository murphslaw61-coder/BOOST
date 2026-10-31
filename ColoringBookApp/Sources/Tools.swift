import SwiftUI

enum ToolMode: Hashable {
    case fill, brush
}

struct ToolSettings: Equatable {
    var mode: ToolMode = .fill
    var brush: BrushKind = .marker
    var size: Double = 24
    var color = RGBA(hex: 0xE63946)
    var gradient = false
    var gradientColor = RGBA(hex: 0xFFD166)
    var stayInsideLines = true

    var brushStroke: BrushStroke {
        BrushStroke(kind: brush, size: CGFloat(size), color: color, stayInsideLines: stayInsideLines)
    }
}

extension BrushKind {
    var title: String {
        switch self {
        case .marker: return "Marker"
        case .pencil: return "Pencil"
        case .airbrush: return "Airbrush"
        case .eraser: return "Eraser"
        }
    }

    var symbol: String {
        switch self {
        case .marker: return "highlighter"
        case .pencil: return "pencil"
        case .airbrush: return "aqi.medium"
        case .eraser: return "eraser"
        }
    }
}

extension RGBA {
    init(hex: UInt32) {
        self.init(r: UInt8((hex >> 16) & 0xFF), g: UInt8((hex >> 8) & 0xFF), b: UInt8(hex & 0xFF))
    }

    init(_ color: Color) {
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        UIColor(color).getRed(&r, green: &g, blue: &b, alpha: &a)
        func c(_ v: CGFloat) -> UInt8 { UInt8((min(max(v, 0), 1) * 255).rounded()) }
        self.init(r: c(r), g: c(g), b: c(b))
    }

    var color: Color {
        Color(red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255)
    }
}

struct Palette: Identifiable {
    let id: String
    let name: String
    let colors: [RGBA]

    init(_ name: String, _ hexes: [UInt32]) {
        self.id = name
        self.name = name
        self.colors = hexes.map(RGBA.init(hex:))
    }
}

enum Palettes {
    static let all: [Palette] = [
        Palette("Garden", [0xE63946, 0xF4A261, 0xE9C46A, 0x8AB17D, 0x2A9D8F, 0x264653, 0xB5838D, 0x6D597A]),
        Palette("Ocean", [0x03045E, 0x0077B6, 0x00B4D8, 0x90E0EF, 0xCAF0F8, 0x2EC4B6, 0xFFBF69, 0xF4F1DE]),
        Palette("Sunset", [0x5F0F40, 0x9A031E, 0xEF476F, 0xE36414, 0xFB8B24, 0xFFD166, 0x7B2CBF, 0x0F4C5C]),
        Palette("Pastel", [0xFFADAD, 0xFFD6A5, 0xFDFFB6, 0xCAFFBF, 0x9BF6FF, 0xA0C4FF, 0xBDB2FF, 0xFFC6FF]),
        Palette("Earth", [0x582F0E, 0x7F4F24, 0x936639, 0xA68A64, 0xB6AD90, 0x656D4A, 0x414833, 0x333D29]),
        Palette("Basics", [0x222222, 0x8D99AE, 0xFFFFFF, 0xD62828, 0xF77F00, 0xFCBF49, 0x2B9348, 0x1D4ED8, 0x7209B7, 0xFF70A6, 0x8B5E3C]),
    ]
}

/// The controls under the page: tool, brush, size and colors.
struct ToolPanel: View {
    @Binding var tool: ToolSettings
    @State private var paletteID = Palettes.all[0].id

    private var palette: Palette {
        Palettes.all.first { $0.id == paletteID } ?? Palettes.all[0]
    }

    var body: some View {
        VStack(spacing: 12) {
            Picker("Tool", selection: $tool.mode) {
                Label("Fill", systemImage: "drop.fill").tag(ToolMode.fill)
                Label("Brush", systemImage: "paintbrush.pointed.fill").tag(ToolMode.brush)
            }
            .pickerStyle(.segmented)

            if tool.mode == .brush {
                brushControls
            } else {
                fillControls
            }

            colorRow
        }
        .padding(.horizontal)
        .padding(.vertical, 12)
        .background(.bar)
    }

    private var brushControls: some View {
        VStack(spacing: 10) {
            HStack(spacing: 6) {
                ForEach(BrushKind.allCases) { kind in
                    Button {
                        tool.brush = kind
                    } label: {
                        VStack(spacing: 4) {
                            Image(systemName: kind.symbol).font(.title3)
                            Text(kind.title).font(.caption2)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 6)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(tool.brush == kind ? Color.accentColor.opacity(0.18) : Color.clear)
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
            HStack {
                Image(systemName: "circle.fill").font(.system(size: 6))
                Slider(value: $tool.size, in: 4...80)
                Image(systemName: "circle.fill").font(.system(size: 18))
            }
            .accessibilityLabel("Brush size")
            Toggle("Stay inside the lines", isOn: $tool.stayInsideLines)
                .font(.subheadline)
        }
    }

    private var fillControls: some View {
        HStack {
            Toggle("Gradient fill", isOn: $tool.gradient)
                .font(.subheadline)
            if tool.gradient {
                ColorPicker("Gradient end color", selection: gradientBinding, supportsOpacity: false)
                    .labelsHidden()
            }
        }
    }

    private var colorRow: some View {
        HStack(spacing: 10) {
            Menu {
                Picker("Palette", selection: $paletteID) {
                    ForEach(Palettes.all) { Text($0.name).tag($0.id) }
                }
            } label: {
                Image(systemName: "paintpalette").font(.title2)
            }
            .accessibilityLabel("Choose palette")

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(palette.colors, id: \.self) { c in
                        Circle()
                            .fill(c.color)
                            .frame(width: 34, height: 34)
                            .overlay(Circle().stroke(Color.primary.opacity(0.25), lineWidth: 1))
                            .overlay(
                                Circle().stroke(Color.accentColor, lineWidth: 3)
                                    .padding(-4)
                                    .opacity(tool.color == c ? 1 : 0)
                            )
                            .onTapGesture { select(c) }
                    }
                }
                .padding(.vertical, 6)
                .padding(.horizontal, 6)
            }

            ColorPicker("Custom color", selection: colorBinding, supportsOpacity: false)
                .labelsHidden()
        }
    }

    private func select(_ color: RGBA) {
        tool.color = color
        if tool.brush == .eraser { tool.brush = .marker }
    }

    private var colorBinding: Binding<Color> {
        Binding(get: { tool.color.color }, set: { select(RGBA($0)) })
    }

    private var gradientBinding: Binding<Color> {
        Binding(get: { tool.gradientColor.color }, set: { tool.gradientColor = RGBA($0) })
    }
}

// Rasterize an SVG to a transparent PNG at a given pixel size (macOS, NSImage supports SVG).
// Draws at 4× and downsamples with high-quality interpolation so 1x/2x/3x bitmaps stay crisp.
// swift scripts/svg2png.swift <in.svg> <out.png> <px>
import AppKit
let args = CommandLine.arguments
guard args.count == 4, let image = NSImage(contentsOfFile: args[1]), let px = Int(args[3]) else { exit(1) }
func bitmap(_ size: Int) -> NSBitmapImageRep {
  let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  rep.size = NSSize(width: size, height: size); return rep
}
let big = bitmap(px * 4)
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: big)
NSGraphicsContext.current?.imageInterpolation = .high
image.draw(in: NSRect(x: 0, y: 0, width: px * 4, height: px * 4), from: .zero, operation: .sourceOver, fraction: 1)
NSGraphicsContext.restoreGraphicsState()
let small = bitmap(px)
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: small)
NSGraphicsContext.current?.imageInterpolation = .high
let bigImage = NSImage(size: NSSize(width: px * 4, height: px * 4)); bigImage.addRepresentation(big)
bigImage.draw(in: NSRect(x: 0, y: 0, width: px, height: px), from: .zero, operation: .sourceOver, fraction: 1)
NSGraphicsContext.restoreGraphicsState()
try! small.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: args[2]))

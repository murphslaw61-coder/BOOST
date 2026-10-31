# Coloring Book (iPhone starter app)

An original SwiftUI coloring app with the core features people expect from apps
like Pigment: tap-to-fill, textured brushes, Apple Pencil pressure, gradient fills,
palettes, zoom, undo/redo, auto-save, and sharing. All code here is written from
scratch; no code or artwork from any other app is used.

## Features

- **Library** of pages with live thumbnails of your progress
- **Add your own pages** from Photos (scans or exports of your coloring-book line art)
- **Tap to fill** any enclosed area, with an optional **gradient fill**
- **Brushes:** marker, pencil (paper-grain texture), airbrush, eraser
- **Stay inside the lines** option for brushes
- **Apple Pencil pressure** changes brush size and strength (iPad)
- **Pinch to zoom, two-finger drag to move**
- **Palettes** plus a custom color picker
- **Undo / redo**, start over
- **Auto-saves** your coloring when you leave a page or the app
- **Share or save** the finished picture (Messages, Photos, Instagram, Print…)

## Set it up in Xcode (about 5 minutes)

1. **Create a project.** In Xcode choose *File ▸ New ▸ Project ▸ iOS ▸ App*.
   Product Name: anything (e.g. `ColorBook`). Interface: **SwiftUI**. Language: **Swift**.
   Storage: **None**. Uncheck tests if you like.
2. **Delete the template files.** In the left sidebar, select `ContentView.swift` and
   `<YourName>App.swift`, press Delete, and choose **Move to Trash**.
   (This project has its own `ColoringBookApp.swift`, which starts the app.)
3. **Add these files.** Drag the `Sources` folder from Finder into the sidebar,
   onto your project's yellow folder. In the dialog, tick **Copy items if needed**
   and make sure your app target is ticked. Click **Finish**.
4. **Set the minimum iOS version.** Click the blue project icon ▸ your target ▸
   *General* ▸ *Minimum Deployments* ▸ **iOS 17.0** (or later).
5. **Allow saving to Photos.** Same target ▸ *Info* tab ▸ hover any row, click **+**,
   choose **Privacy - Photo Library Additions Usage Description**, and set the value to
   `Save your finished pages to Photos.` (Without this the app crashes when someone
   taps *Save Image* in the share sheet.)
6. **Run it.** Pick an iPhone simulator at the top of the window and press **⌘R**.
   To run on your own iPhone: plug it in, select it, and under
   *Signing & Capabilities* choose your Apple ID as the **Team**.

> Tip: page loading and painting are much faster in a Release build. For the most
> realistic feel on a device, use *Product ▸ Scheme ▸ Edit Scheme ▸ Run ▸
> Build Configuration ▸ Release*.

## How to use it

- Tap a page. Choose **Fill** and tap areas, or choose **Brush** and draw.
- Pinch with two fingers to zoom; drag with two fingers to move.
- Long-press a page in the library to start over or delete it.
- Tap **+** in the library to add your own line art.

### Getting good results with your own pages

- Use **black lines on white**. Clean digital line art (PNG) works best;
  phone photos of printed pages work if the lighting is even.
- Shapes need **closed outlines** — a gap in a line lets a fill spill into the
  next area.
- Working size is 1024 px on the long side (`ColoringEngine.defaultMaxSide`).
  Raise it to 1536 or 2048 for very detailed pages (uses more memory).

## Files

| File | What it does |
|---|---|
| `ColoringBookApp.swift` | App entry point |
| `LibraryView.swift` | Page grid, importing pages from Photos |
| `ColoringScreen.swift` | Coloring screen: toolbar, undo/redo, share, auto-save |
| `ColoringCanvas.swift` | Zoomable canvas and touch / Apple Pencil handling |
| `ColoringEngine.swift` | Fill, brushes, gradients, undo — the pixel work |
| `Tools.swift` | Tool settings, brushes, palettes, bottom tool panel |
| `PageStore.swift` | Saves pages and progress in the app's Documents folder |
| `LineArtLibrary.swift` | Five starter pages drawn in code (replace with your art) |

## Ideas for next steps

- **Bundle your own books:** add your line-art PNGs to *Assets* and list them in
  `LineArtLibrary` so they ship with the app.
- **Sell page packs** with StoreKit in-app purchases (one-time packs instead of a
  subscription can be a selling point).
- **Link to your shop** from the library (e.g. "Get the printed book").
- **iCloud sync** of progress across devices.
- **Color-by-number** mode: number each area and match it to a palette.

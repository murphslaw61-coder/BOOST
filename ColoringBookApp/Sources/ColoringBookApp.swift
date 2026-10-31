import SwiftUI

@main
struct ColoringBookApp: App {
    @StateObject private var store = PageStore()

    var body: some Scene {
        WindowGroup {
            LibraryView()
                .environmentObject(store)
        }
    }
}

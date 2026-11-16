import { defineAppHotkeys } from "@tanstack/react-hotkeys"

export const appHotkeys = defineAppHotkeys({
  "palette.toggle": {
    hotkey: "Mod+K",
    meta: { name: "Toggle the command palette", group: "palette" },
    options: { requireReset: true, preventDefault: "always" },
  },
  "palette.search": {
    hotkey: "/",
    meta: { name: "Search", group: "palette" },
  },
  "reader.left": {
    hotkey: "ArrowLeft",
    meta: { name: "Turn the page left", group: "turn" },
  },
  "reader.right": {
    hotkey: "ArrowRight",
    meta: { name: "Turn the page right", group: "turn" },
  },
  "reader.leftKey": {
    hotkey: "[KeyA]",
    meta: { name: "Turn the page left", group: "turn" },
  },
  "reader.rightKey": {
    hotkey: "[KeyD]",
    meta: { name: "Turn the page right", group: "turn" },
  },
  "reader.next": {
    hotkey: "Space",
    meta: { name: "Next page", group: "next" },
    options: { preventDefault: false },
  },
  "reader.nextPageDown": {
    hotkey: "PageDown",
    meta: { name: "Next page", group: "next" },
    options: { preventDefault: false },
  },
  "reader.previous": {
    hotkey: "Shift+Space",
    meta: { name: "Previous page", group: "prev" },
    options: { preventDefault: false },
  },
  "reader.previousPageUp": {
    hotkey: "PageUp",
    meta: { name: "Previous page", group: "prev" },
    options: { preventDefault: false },
  },
  "reader.first": {
    hotkey: "Home",
    meta: { name: "First page", group: "edges" },
  },
  "reader.last": {
    hotkey: "End",
    meta: { name: "Last page", group: "edges" },
  },
  "reader.previousChapter": {
    hotkey: "[",
    meta: { name: "Previous chapter", group: "chapter" },
    options: { requireReset: true },
  },
  "reader.nextChapter": {
    hotkey: "]",
    meta: { name: "Next chapter", group: "chapter" },
    options: { requireReset: true },
  },
  "reader.menu": {
    hotkey: "M",
    meta: { name: "Toggle the menu", group: "menu" },
    options: { requireReset: true },
  },
  "reader.fullscreen": {
    hotkey: "F",
    meta: { name: "Toggle fullscreen", group: "fullscreen" },
    options: { requireReset: true },
  },
  "reader.layout": {
    hotkey: "L",
    meta: { name: "Cycle the layout", group: "layout" },
    options: { requireReset: true },
  },
  "reader.autoScroll": {
    hotkey: "S",
    meta: { name: "Toggle auto-scroll", group: "autoScroll" },
    options: { requireReset: true },
  },
  "reader.zoomIn": {
    hotkey: "+",
    meta: { name: "Zoom in", group: "zoom" },
  },
  "reader.zoomInEqual": {
    hotkey: "=",
    meta: { name: "Zoom in", group: "zoom" },
  },
  "reader.zoomOut": {
    hotkey: "-",
    meta: { name: "Zoom out", group: "zoom" },
  },
  "reader.zoomReset": {
    hotkey: "0",
    meta: { name: "Reset the zoom", group: "zoomReset" },
  },
  "reader.bookmark": {
    hotkey: "B",
    meta: { name: "Toggle a bookmark", group: "bookmark" },
    options: { requireReset: true },
  },
})

declare module "@tanstack/react-hotkeys" {
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}

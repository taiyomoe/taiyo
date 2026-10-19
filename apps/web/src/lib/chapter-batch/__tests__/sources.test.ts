import { zipSync } from "fflate"
import { describe, expect, it } from "vitest"
import { readChapterSources } from "../sources"

const image = (name: string, size = 3) => new File([new Uint8Array(size)], name)
const pageNames = (chapter: { path: string; pages: Array<{ name: string }> }) => [
  chapter.path,
  chapter.pages.map((page) => page.name),
]
const archive = (name: string, entries: Record<string, number>) =>
  new File(
    [
      zipSync(
        Object.fromEntries(
          Object.entries(entries).map(([path, size]) => [path, new Uint8Array(size)]),
        ),
      ),
    ],
    name,
  )

describe("readChapterSources", () => {
  it("makes a chapter of each folder of images, in natural order", async () => {
    const { chapters, unsupported } = await readChapterSources([
      { path: "Series/Ch 10/2.png", file: image("2.png") },
      { path: "Series/Ch 10/10.png", file: image("10.png") },
      { path: "Series/Ch 9/1.jpg", file: image("1.jpg") },
      { path: "Series/.DS_Store", file: image(".DS_Store") },
      { path: "Series/notes.txt", file: image("notes.txt") },
    ])

    expect(chapters.map(pageNames)).toEqual([
      ["Series/Ch 9", ["1.jpg"]],
      ["Series/Ch 10", ["2.png", "10.png"]],
    ])
    expect(chapters[0]?.pages[0]?.type).toBe("image/jpeg")
    expect(unsupported).toEqual(["notes.txt"])
  })

  it("makes a chapter of each archive, or of each folder inside one", async () => {
    const { chapters } = await readChapterSources([
      { path: "c003.cbz", file: archive("c003.cbz", { "2.webp": 4, "1.webp": 5, "info.xml": 2 }) },
      {
        path: "Vol 2.zip",
        file: archive("Vol 2.zip", {
          "Ch 5/1.png": 1,
          "Ch 6/1.png": 1,
          "__MACOSX/Ch 5/._1.png": 1,
        }),
      },
    ])

    expect(chapters.map((chapter) => [chapter.name, chapter.path, chapter.pages.length])).toEqual([
      ["c003", "c003", 2],
      ["Ch 5", "Vol 2/Ch 5", 1],
      ["Ch 6", "Vol 2/Ch 6", 1],
    ])
    expect(chapters[0]?.pages.map((page) => [page.name, page.size])).toEqual([
      ["1.webp", 5],
      ["2.webp", 4],
    ])

    const blobs = await chapters[0]?.open()

    expect([...(blobs?.values() ?? [])].map((blob) => [blob.size, blob.type])).toEqual([
      [5, "image/webp"],
      [4, "image/webp"],
    ])
  })

  it("reports archives it cannot read", async () => {
    const { chapters, unsupported } = await readChapterSources([
      { path: "broken.zip", file: new File(["not a zip"], "broken.zip") },
    ])

    expect(chapters).toEqual([])
    expect(unsupported).toEqual(["broken.zip"])
  })
})

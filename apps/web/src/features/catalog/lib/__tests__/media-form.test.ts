import { describe, expect, it } from "vitest"
import type { MediaEditDraft } from "@/features/media-suggestions/lib/media-edit-model"
import { buildMediaForm, getMediaImagesError } from "@/features/catalog/lib/media-form"

const draft: MediaEditDraft = {
  titles: [
    { title: " One Punch Man ", language: "en", isMainTitle: true, isAcronym: false },
    { title: "ワンパンマン", language: "ja", isMainTitle: false, isAcronym: false },
    { title: "OPM", language: "en", isMainTitle: false, isAcronym: true },
  ],
  synopsis: { en: " A hero. ", fr: "  " },
  type: "MANGA",
  status: "RELEASING",
  source: "ORIGINAL",
  demography: "SEINEN",
  countryOfOrigin: "JAPAN",
  contentRating: "NORMAL",
  startDate: "2009-06-03T00:00:00.000Z",
  endDate: null,
  tags: [{ key: "ACTION", isSpoiler: false }],
  links: { anilist: 30044, mangaDex: "" },
  staffs: [],
}

describe("buildMediaForm", () => {
  it("ranks titles per language and drops empty values", () => {
    const file = new File(["x"], "cover.png", { type: "image/png" })
    const form = buildMediaForm(
      draft,
      [{ file, volume: 1, language: "ja", contentRating: "NORMAL", main: true }],
      [],
    )

    expect(form.get("titles.0.title")).toBe("One Punch Man")
    expect(form.get("titles.0.priority")).toBe("1")
    expect(form.get("titles.1.priority")).toBe("1")
    expect(form.get("titles.2.priority")).toBe("2")
    expect(form.get("synopsis.en")).toBe("A hero.")
    expect(form.has("synopsis.fr")).toBe(false)
    expect(form.get("links.anilist")).toBe("30044")
    expect(form.has("links.mangaDex")).toBe(false)
    expect(form.get("covers.0.file")).toBeInstanceOf(File)
    expect(form.get("covers.0.volume")).toBe("1")
    expect(form.get("startDate")).toBe("2009-06-03T00:00:00.000Z")
    expect(form.has("endDate")).toBe(false)
  })
})

describe("getMediaImagesError", () => {
  it("needs exactly one main cover with valid volumes", () => {
    expect(getMediaImagesError([])).toBe("missing-cover")
    expect(getMediaImagesError([{ main: true, volume: undefined }])).toBe("invalid-volume")
    expect(getMediaImagesError([{ main: false, volume: null }])).toBe("main-cover")
    expect(getMediaImagesError([{ main: true, volume: 2 }])).toBeNull()
  })
})

import { describe, expect, it } from "vitest"
import { contentRatingBadge, getMediaCardModel, getSynopsis } from "../media-labels"

const hit = {
  type: "MANHWA" as const,
  status: "RELEASING" as const,
  contentRating: "NORMAL" as const,
  mainTitle: { title: "Solo Leveling", language: "en" as const },
  mainCoverUrl: "https://cdn.taiyo.moe/medias/m/covers/c.jpg",
}

describe("getMediaCardModel", () => {
  it("maps a hit to its title, cover and type/status labels", () => {
    expect(getMediaCardModel(hit)).toEqual({
      title: "Solo Leveling",
      coverUrl: "https://cdn.taiyo.moe/medias/m/covers/c.jpg",
      typeLabel: "Manhwa",
      statusLabel: "Releasing",
      rating: null,
    })
  })

  it("falls back to an untitled label and keeps a missing cover null", () => {
    const model = getMediaCardModel({ ...hit, mainTitle: null, mainCoverUrl: null })

    expect(model.title).toBe("Untitled")
    expect(model.coverUrl).toBeNull()
  })

  it("labels every type and status", () => {
    expect(getMediaCardModel({ ...hit, type: "LIGHT_NOVEL" }).typeLabel).toBe("Light novel")
    expect(getMediaCardModel({ ...hit, status: "NOT_YET_RELEASED" }).statusLabel).toBe(
      "Not yet released",
    )
  })
})

describe("contentRatingBadge", () => {
  it("shows no pill for safe content", () => {
    expect(contentRatingBadge("NORMAL")).toBeNull()
  })

  it("warns on suggestive content and errors on explicit content", () => {
    expect(contentRatingBadge("SUGGESTIVE")).toEqual({ label: "Suggestive", variant: "warning" })
    expect(contentRatingBadge("NSFW")).toEqual({ label: "NSFW", variant: "error" })
    expect(contentRatingBadge("NSFL")).toEqual({ label: "NSFL", variant: "error" })
  })
})

describe("getSynopsis", () => {
  it("prefers the locale, then English, then any language", () => {
    expect(getSynopsis({ en: "English", pt_br: "Português" }, "pt_br")).toBe("Português")
    expect(getSynopsis({ en: "English", ru: "Русский" }, "pt_br")).toBe("English")
    expect(getSynopsis({ ru: "Русский" }, "en")).toBe("Русский")
    expect(getSynopsis({}, "en")).toBeNull()
  })
})

import { describe, expect, it } from "vitest"
import { toMediaLinks } from "../to-media-links"

describe("toMediaLinks", () => {
  describe("input handling", () => {
    it("should return empty object for empty input", () => {
      expect(toMediaLinks({})).toEqual({})
    })

    it("should skip null values", () => {
      const result = toMediaLinks({ anilist: null, kitsu: "12345" })

      expect(result).toEqual({ kitsu: "12345" })
    })

    it("should skip undefined values", () => {
      const result = toMediaLinks({ anilist: undefined, kitsu: "12345" })

      expect(result).toEqual({ kitsu: "12345" })
    })

    it("should skip non-string values", () => {
      const result = toMediaLinks({ anilist: 12345, kitsu: "12345" })

      expect(result).toEqual({ kitsu: "12345" })
    })

    it("should skip empty string values", () => {
      const result = toMediaLinks({ anilist: "", kitsu: "12345" })

      expect(result).toEqual({ kitsu: "12345" })
    })
  })

  describe("myAnimeList and anilist parsing", () => {
    it("should extract numeric ID from myAnimeList URL", () => {
      const result = toMediaLinks({
        myAnimeList: "https://myanimelist.net/manga/86337",
      })

      expect(result).toEqual({ myAnimeList: 86337 })
    })

    it("should extract numeric ID from anilist URL", () => {
      const result = toMediaLinks({
        anilist: "https://anilist.co/manga/86123",
      })

      expect(result).toEqual({ anilist: 86123 })
    })

    it("should handle URLs with trailing slashes", () => {
      const result = toMediaLinks({
        myAnimeList: "https://myanimelist.net/manga/86337/",
      })

      expect(result).toEqual({ myAnimeList: 86337 })
    })

    it("should handle URLs with title slugs", () => {
      const result = toMediaLinks({
        myAnimeList: "https://myanimelist.net/manga/86337/Black_Clover",
      })

      expect(result).toEqual({ myAnimeList: 86337 })
    })
  })

  describe("officialEnglishTranslation mapping", () => {
    it("should map officialEnglishTranslation to officialENTranslation", () => {
      const result = toMediaLinks({
        officialEnglishTranslation: "https://example.com/en",
      })

      expect(result).toEqual({
        officialENTranslation: "https://example.com/en",
      })
    })
  })

  describe("valid link keys", () => {
    it("should pass through valid link keys", () => {
      const result = toMediaLinks({
        kitsu: "https://kitsu.io/manga/123",
        amazon: "https://amazon.com/dp/123",
        raw: "https://raw.example.com",
      })

      expect(result).toEqual({
        kitsu: "https://kitsu.io/manga/123",
        amazon: "https://amazon.com/dp/123",
        raw: "https://raw.example.com",
      })
    })

    it("should handle all valid translation links", () => {
      const result = toMediaLinks({
        officialENTranslation: "https://example.com/en",
        officialFRTranslation: "https://example.com/fr",
        officialPTBRTranslation: "https://example.com/pt-br",
      })

      expect(result).toEqual({
        officialENTranslation: "https://example.com/en",
        officialFRTranslation: "https://example.com/fr",
        officialPTBRTranslation: "https://example.com/pt-br",
      })
    })
  })

  describe("invalid keys", () => {
    it("should skip invalid link keys", () => {
      const result = toMediaLinks({
        invalidKey: "https://example.com",
        kitsu: "https://kitsu.io/manga/123",
      })

      expect(result).toEqual({ kitsu: "https://kitsu.io/manga/123" })
    })

    it("should return empty object when all keys are invalid", () => {
      const result = toMediaLinks({
        invalid1: "https://example1.com",
        invalid2: "https://example2.com",
      })

      expect(result).toEqual({})
    })
  })

  describe("mixed inputs", () => {
    it("should handle a mix of valid keys, mappings, and invalid keys", () => {
      const result = toMediaLinks({
        myAnimeList: "https://myanimelist.net/manga/86337",
        anilist: "https://anilist.co/manga/86123",
        officialEnglishTranslation: "https://example.com/en",
        kitsu: "https://kitsu.io/manga/123",
        invalidKey: "https://invalid.com",
        nullValue: null,
      })

      expect(result).toEqual({
        myAnimeList: 86337,
        anilist: 86123,
        officialENTranslation: "https://example.com/en",
        kitsu: "https://kitsu.io/manga/123",
      })
    })
  })
})

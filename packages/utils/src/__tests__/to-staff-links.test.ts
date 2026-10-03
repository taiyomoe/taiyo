import { describe, expect, it } from "vitest"
import { toStaffLinks } from "../to-staff-links"

describe("toStaffLinks", () => {
  describe("input handling", () => {
    it("should return empty object for empty input", () => {
      expect(toStaffLinks({})).toEqual({})
    })

    it("should skip null values", () => {
      const result = toStaffLinks({ twitter: null, pixiv: "12345" })

      expect(result).toEqual({ pixiv: "12345" })
    })

    it("should skip undefined values", () => {
      const result = toStaffLinks({ twitter: undefined, pixiv: "12345" })

      expect(result).toEqual({ pixiv: "12345" })
    })

    it("should skip non-string values", () => {
      const result = toStaffLinks({ twitter: 12345, pixiv: "12345" })

      expect(result).toEqual({ pixiv: "12345" })
    })

    it("should skip empty string values", () => {
      const result = toStaffLinks({ twitter: "", pixiv: "12345" })

      expect(result).toEqual({ pixiv: "12345" })
    })
  })

  describe("melonBook mapping", () => {
    it("should map melonBook to melonBooks", () => {
      const result = toStaffLinks({
        melonBook: "https://www.melonbooks.co.jp/circle/123",
      })

      expect(result).toEqual({
        melonBooks: "https://www.melonbooks.co.jp/circle/123",
      })
    })
  })

  describe("valid link keys", () => {
    it("should pass through valid link keys", () => {
      const result = toStaffLinks({
        website: "https://example.com",
        twitter: "https://twitter.com/author",
        pixiv: "https://pixiv.net/users/123",
      })

      expect(result).toEqual({
        website: "https://example.com",
        twitter: "https://twitter.com/author",
        pixiv: "https://pixiv.net/users/123",
      })
    })

    it("should handle all valid social links", () => {
      const result = toStaffLinks({
        youtube: "https://youtube.com/@author",
        tumblr: "https://author.tumblr.com",
        discord: "https://discord.gg/invite",
        fanbox: "https://author.fanbox.cc",
        fantia: "https://fantia.jp/fanclubs/123",
      })

      expect(result).toEqual({
        youtube: "https://youtube.com/@author",
        tumblr: "https://author.tumblr.com",
        discord: "https://discord.gg/invite",
        fanbox: "https://author.fanbox.cc",
        fantia: "https://fantia.jp/fanclubs/123",
      })
    })

    it("should handle Japanese platform links", () => {
      const result = toStaffLinks({
        nicoVideo: "https://www.nicovideo.jp/user/123",
        booth: "https://author.booth.pm",
        skeb: "https://skeb.jp/@author",
      })

      expect(result).toEqual({
        nicoVideo: "https://www.nicovideo.jp/user/123",
        booth: "https://author.booth.pm",
        skeb: "https://skeb.jp/@author",
      })
    })

    it("should handle Asian platform links", () => {
      const result = toStaffLinks({
        namicomi: "https://namicomi.com/author",
        naver: "https://comic.naver.com/author",
        weibo: "https://weibo.com/author",
      })

      expect(result).toEqual({
        namicomi: "https://namicomi.com/author",
        naver: "https://comic.naver.com/author",
        weibo: "https://weibo.com/author",
      })
    })
  })

  describe("invalid keys", () => {
    it("should skip invalid link keys", () => {
      const result = toStaffLinks({
        invalidKey: "https://example.com",
        twitter: "https://twitter.com/author",
      })

      expect(result).toEqual({ twitter: "https://twitter.com/author" })
    })

    it("should return empty object when all keys are invalid", () => {
      const result = toStaffLinks({
        invalid1: "https://example1.com",
        invalid2: "https://example2.com",
      })

      expect(result).toEqual({})
    })
  })

  describe("mixed inputs", () => {
    it("should handle a mix of valid keys, mappings, and invalid keys", () => {
      const result = toStaffLinks({
        website: "https://example.com",
        twitter: "https://twitter.com/author",
        melonBook: "https://www.melonbooks.co.jp/circle/123",
        invalidKey: "https://invalid.com",
        nullValue: null,
      })

      expect(result).toEqual({
        website: "https://example.com",
        twitter: "https://twitter.com/author",
        melonBooks: "https://www.melonbooks.co.jp/circle/123",
      })
    })
  })
})

import { describe, expect, test } from "vitest"
import { parseMangaDexId } from "../mangadex-id"

const ID = "b0b721ff-c388-4486-aa0f-c2b0bb321512"

describe("parseMangaDexId", () => {
  test("reads a bare ID", () => {
    expect(parseMangaDexId(` ${ID.toUpperCase()} `)).toBe(ID)
  })

  test("reads a title link, with or without its slug", () => {
    expect(parseMangaDexId(`https://mangadex.org/title/${ID}/sousou-no-frieren`)).toBe(ID)
    expect(parseMangaDexId(`https://mangadex.org/title/${ID}`)).toBe(ID)
  })

  test("rejects other links and text", () => {
    expect(parseMangaDexId(`https://mangadex.org/chapter/${ID}`)).toBeNull()
    expect(parseMangaDexId(`https://example.com/title/${ID}`)).toBeNull()
    expect(parseMangaDexId("frieren")).toBeNull()
  })
})

import { describe, expect, it } from "vitest"
import { parseChapterName } from "../parse-chapter-name"

describe("parseChapterName", () => {
  it.each([
    ["Chapter 12", { number: 12, volume: null, title: null }],
    ["012", { number: 12, volume: null, title: null }],
    ["Ch.12.5", { number: 12.5, volume: null, title: null }],
    ["Vol.02 Ch.012 - The Return", { number: 12, volume: "2", title: "The Return" }],
    ["c012 (v02) [Some Scans]", { number: 12, volume: "2", title: null }],
    ["One Piece 1100.cbz", { number: 1100, volume: null, title: null }],
    ["Kimi ni Todoke 2 - 015 - Friends", { number: 15, volume: null, title: "Friends" }],
    ["Volume 3 Chapter 21: A New Day", { number: 21, volume: "3", title: "A New Day" }],
    ["Capítulo 7,5", { number: 7.5, volume: null, title: null }],
    ["[Group] Title - 045 [1600px].zip", { number: 45, volume: null, title: null }],
    ["Episode 3", { number: 3, volume: null, title: null }],
    ["Extras", { number: null, volume: null, title: null }],
    ["music_ch_4", { number: 4, volume: null, title: null }],
    ["Vol 2/Ch 5", { number: 5, volume: "2", title: null }],
    ["series/Volume 03/012 - Return", { number: 12, volume: "3", title: "Return" }],
    ["Chapters/015", { number: 15, volume: null, title: null }],
  ])("reads %s", (name, expected) => {
    expect(parseChapterName(name)).toEqual(expected)
  })
})

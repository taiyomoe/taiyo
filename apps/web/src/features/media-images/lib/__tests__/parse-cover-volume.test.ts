import { describe, expect, it } from "vitest"
import { parseCoverVolume } from "../parse-cover-volume"

describe("parseCoverVolume", () => {
  it.each([
    ["Vol.03.jpg", "3"],
    ["volume 12.png", "12"],
    ["tomodachi_game_v07_cover.webp", "7"],
    ["Tome 5.jpg", "5"],
    ["[Group] Title - 014.jpg", "14"],
    ["cover.jpg", ""],
    ["vol_000.jpg", ""],
    ["Title v2 (2019).jpg", "2"],
  ])("parses %s", (name, expected) => {
    expect(parseCoverVolume(name)).toBe(expected)
  })
})

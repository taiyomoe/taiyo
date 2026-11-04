import { describe, expect, it } from "vitest"
import { getImageFilter } from "../reader-filter"
import { DEFAULT_READER_SETTINGS, readerSettingsSchema } from "../reader-settings"

describe("readerSettingsSchema", () => {
  it("defaults to a single page fitted to the screen, and a long strip for manhwa and manhua", () => {
    expect(DEFAULT_READER_SETTINGS).toMatchObject({
      mode: "single",
      longStripMode: "strip",
      fit: "screen",
      direction: "ltr",
      progressStyle: "segments",
      confirmChapterChange: true,
    })
  })

  it("keeps valid fields and resets broken ones from stored data", () => {
    expect(
      readerSettingsSchema.parse({ mode: "strip", brightness: 9000, background: "red", extra: 1 }),
    ).toMatchObject({ mode: "strip", brightness: 100, background: "#000000" })
  })
})

describe("getImageFilter", () => {
  it("emits nothing at the defaults", () => {
    expect(getImageFilter(DEFAULT_READER_SETTINGS)).toBe("none")
  })

  it("combines the adjusted filters", () => {
    expect(
      getImageFilter({ ...DEFAULT_READER_SETTINGS, brightness: 70, warmth: 30, invert: true }),
    ).toBe("brightness(70%) sepia(30%) invert(1) hue-rotate(180deg)")
  })
})

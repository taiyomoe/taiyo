import { describe, expect, it } from "vitest"
import {
  filterTagSections,
  getTagSections,
  getVisibleTags,
  nextTagState,
  setTagState,
  type TagSection,
} from "../search-tags"

const tagsOf = (sections: TagSection[]) =>
  sections.flatMap((section) => section.groups.flatMap((group) => group.tags))

describe("tag states", () => {
  it("cycles none → include → exclude → none", () => {
    expect(nextTagState(undefined)).toBe("include")
    expect(nextTagState("include")).toBe("exclude")
    expect(nextTagState("exclude")).toBeUndefined()
  })

  it("moves a tag between the include and exclude lists", () => {
    const included = setTagState({ tags: [], excludedTags: [] }, "ACTION", "include")
    const excluded = setTagState(included, "ACTION", "exclude")

    expect(included).toEqual({ tags: ["ACTION"], excludedTags: [] })
    expect(excluded).toEqual({ tags: [], excludedTags: ["ACTION"] })
    expect(setTagState(excluded, "ACTION", undefined)).toEqual({ tags: [], excludedTags: [] })
  })
})

describe("tag sections", () => {
  it("files every tag under exactly one section", () => {
    const keys = tagsOf(getTagSections("en")).map((tag) => tag.key)

    expect(new Set(keys).size).toBe(keys.length)
    expect(keys).toContain("ACTION")
  })

  it("filters by name and hides tags the reader may not see", () => {
    const sections = filterTagSections(getTagSections("en"), "rom", (tag) => !tag.isAdult)
    const names = tagsOf(sections).map((tag) => tag.name)

    expect(names.length).toBeGreaterThan(0)
    expect(names.every((name) => name.toLowerCase().includes("rom"))).toBe(true)
  })
})

describe("getVisibleTags", () => {
  it("hides spoilers and unknown keys, and lists genres first", () => {
    const tags = getVisibleTags(["ISEKAI", "ACTION", "MYSTERY", "NOPE"], ["MYSTERY"], "en")

    expect(tags.map((tag) => tag.key)).not.toContain("MYSTERY")
    expect(tags.map((tag) => tag.key)).not.toContain("NOPE")
    expect(tags[0]?.isGenre).toBe(true)
  })
})

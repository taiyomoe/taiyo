import { config } from "@taiyomoe/config"
import type { ContentLanguage } from "@/lib/locale"

export type TagKey = keyof typeof config.tags

export type TagState = "include" | "exclude"

export type SearchTag = {
  key: TagKey
  name: string
  isAdult: boolean
}

type TagGroup = {
  label: string | null
  tags: SearchTag[]
}

export type TagSection = {
  id: TagSectionId
  groups: TagGroup[]
}

const TAG_SECTION_IDS = [
  "Genre",
  "Theme",
  "Technical",
  "Setting",
  "Cast",
  "Demographic",
  "Sexual Content",
] as const

export type TagSectionId = (typeof TAG_SECTION_IDS)[number]

export const isTagKey = (key: string): key is TagKey => Object.hasOwn(config.tags, key)

const nameIn = (
  names: { en: string } & Partial<Record<string, string>>,
  language: ContentLanguage,
) => names[language] ?? names.en
const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)
const byGroupLabel = (a: { label: string | null }, b: { label: string | null }) => {
  if (a.label === null || b.label === null) {
    return Number(a.label !== null) - Number(b.label !== null)
  }

  return a.label.localeCompare(b.label)
}
const TAGS = Object.keys(config.tags)
  .filter(isTagKey)
  .map((key) => {
    const tag = config.tags[key]
    const [section = "", ...rest] = tag.category.split("-")

    return {
      key,
      names: tag.name,
      isAdult: tag.isAdult,
      section,
      group: rest.length === 0 ? null : rest.join(" · "),
    }
  })
const TAG_BY_KEY = new Map(TAGS.map((tag) => [tag.key, tag]))

export const getTagName = (key: TagKey, language: ContentLanguage) => {
  const tag = TAG_BY_KEY.get(key)

  return tag === undefined ? key : nameIn(tag.names, language)
}

export const getTagSections = (language: ContentLanguage): TagSection[] =>
  TAG_SECTION_IDS.map((id) => {
    const groups = new Map<string | null, SearchTag[]>()

    for (const tag of TAGS) {
      if (tag.section === id) {
        groups.set(tag.group, [
          ...(groups.get(tag.group) ?? []),
          { key: tag.key, name: nameIn(tag.names, language), isAdult: tag.isAdult },
        ])
      }
    }

    return {
      id,
      groups: [...groups.entries()]
        .map(([group, tags]) => ({ label: group, tags: tags.sort(byName) }))
        .sort(byGroupLabel),
    }
  })

export const filterTagSections = (
  sections: TagSection[],
  query: string,
  isVisible: (tag: SearchTag) => boolean,
) => {
  const needle = query.trim().toLocaleLowerCase()

  return sections
    .map((section) => ({
      ...section,
      groups: section.groups
        .map((group) => ({
          ...group,
          tags: group.tags.filter(
            (tag) =>
              isVisible(tag) && (needle === "" || tag.name.toLocaleLowerCase().includes(needle)),
          ),
        }))
        .filter((group) => group.tags.length > 0),
    }))
    .filter((section) => section.groups.length > 0)
}

export const nextTagState = (state: TagState | undefined): TagState | undefined => {
  if (state === undefined) {
    return "include"
  }

  return state === "include" ? "exclude" : undefined
}

export const setTagState = (
  selection: { tags: TagKey[]; excludedTags: TagKey[] },
  key: TagKey,
  state: TagState | undefined,
) => ({
  tags:
    state === "include"
      ? [...selection.tags.filter((tag) => tag !== key), key]
      : selection.tags.filter((tag) => tag !== key),
  excludedTags:
    state === "exclude"
      ? [...selection.excludedTags.filter((tag) => tag !== key), key]
      : selection.excludedTags.filter((tag) => tag !== key),
})

export const getVisibleTags = (
  tagKeys: readonly string[],
  spoilerTagKeys: readonly string[],
  language: ContentLanguage,
) =>
  tagKeys
    .filter((key) => !spoilerTagKeys.includes(key))
    .flatMap((key) => {
      const tag = isTagKey(key) ? TAG_BY_KEY.get(key) : undefined

      return tag === undefined
        ? []
        : [{ key: tag.key, name: nameIn(tag.names, language), isGenre: tag.section === "Genre" }]
    })
    .sort((a, b) => Number(b.isGenre) - Number(a.isGenre))

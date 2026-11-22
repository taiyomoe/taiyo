import { config } from "@taiyomoe/config"
import {
  type ContentRating,
  type DB,
  type Kysely,
  type LocalizedText,
  type MangaDexSyncItemDetails,
  type MangaDexSyncSummary,
  type MediaDemography,
  type MediaEdit,
  type MediaLanguage,
  MEDIA_LINK_KEYS,
  type MediaLinks,
  type MediaStatus,
  type StaffRole,
  sql,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@taiyomoe/db"
import {
  CHAPTER_LANGUAGES,
  type MangaDexClient,
  toChapterNumber,
  toContentRating,
  toExternalUrl,
  toMangaDexLanguage,
  toMediaDemography,
  toMediaLanguage,
  toMediaLinks,
  toMediaStatus,
  toStaffLinks,
  toSupportedLanguage,
  toTagKey,
  toVolume,
} from "@taiyomoe/mangadex"
import {
  checkMediaEdit,
  diffMediaEdit,
  normalizeMediaEdit,
  readMediaEdit,
  applyMediaEdit,
} from "./media-edit"

type PlanDeps = { db: Kysely<DB>; mangaDex: MangaDexClient }

type MediaFieldProposal =
  | { field: "status"; current: MediaStatus; proposed: MediaStatus }
  | { field: "demography"; current: MediaDemography; proposed: MediaDemography }
  | { field: "contentRating"; current: ContentRating; proposed: ContentRating }
  | { field: "startDate"; current: string | null; proposed: string }

const lower = (value: string) => value.trim().toLowerCase()
// MangaDex descriptions often end with a `---` rule followed by links to other sites.
const toSynopsis = (description: string) =>
  (description.split(/\n\s*-{3,}\s*(?:\n|$)/)[0] ?? "")
    .trim()
    .slice(0, config.input.maxSynopsisLength)
const chapterKey = (language: string, number: number) => `${language}:${number}`
const toBio = (biography: Record<string, string>) => {
  const bio: LocalizedText = {}

  for (const [language, text] of Object.entries(biography)) {
    const supported = toSupportedLanguage(language)

    if (supported !== null) {
      bio[supported] = text.slice(0, config.input.maxDescriptionLength)
    }
  }

  return bio
}

/**
 * Compares a media with its MangaDex entry and lists what Taiyō is missing. Every item has a
 * stable `key` the sync is started with, and `selected` says whether it is ticked by default.
 */
export const buildMangaDexPlan = async (
  { db, mangaDex }: PlanDeps,
  mediaId: string,
  mangaDexId: string,
) => {
  const manga = await mangaDex.getManga(mangaDexId)
  const mangaDexCovers = await mangaDex.listCovers(mangaDexId)
  const mangaDexChapters = await mangaDex.listChapters(mangaDexId, CHAPTER_LANGUAGES)
  const current = await readMediaEdit(db, mediaId)
  const staffNames = [...new Set(manga.staff.map((staff) => lower(staff.name)))]
  const groupNames = [
    ...new Set(mangaDexChapters.flatMap((chapter) => chapter.groups.map((g) => lower(g.name)))),
  ]
  const [knownStaffs, knownGroups, covers, chapters, imported] = await Promise.all([
    staffNames.length === 0
      ? []
      : db
          .selectFrom("staffs")
          .select(["id", sql<string>`lower("name")`.as("name")])
          .where(sql<string>`lower("name")`, "in", staffNames)
          .where("deletedAt", "is", null)
          .orderBy("createdAt")
          .execute(),
    groupNames.length === 0
      ? []
      : db
          .selectFrom("groups")
          .select(sql<string>`lower("name")`.as("name"))
          .where(sql<string>`lower("name")`, "in", groupNames)
          .where("deletedAt", "is", null)
          .execute(),
    db
      .selectFrom("covers")
      .select(["volume", "language"])
      .where("mediaId", "=", mediaId)
      .where("deletedAt", "is", null)
      .execute(),
    db
      .selectFrom("chapters")
      .leftJoin("chapterGroups", "chapterGroups.chapterId", "chapters.id")
      .leftJoin("groups", (join) =>
        join.onRef("groups.id", "=", "chapterGroups.groupId").on("groups.deletedAt", "is", null),
      )
      .select([
        "chapters.number",
        "chapters.language",
        sql<
          string[]
        >`coalesce(array_agg(lower("groups"."name")) filter (where "groups"."id" is not null), '{}')`.as(
          "groups",
        ),
      ])
      .where("chapters.mediaId", "=", mediaId)
      .where("chapters.deletedAt", "is", null)
      .where("chapters.status", "!=", "REJECTED")
      .groupBy("chapters.id")
      .execute(),
    db
      .selectFrom("mangaDexSyncItems")
      .innerJoin("mangaDexSyncs", "mangaDexSyncs.id", "mangaDexSyncItems.syncId")
      .select("mangaDexSyncItems.mangaDexId")
      .where("mangaDexSyncs.mediaId", "=", mediaId)
      .where("mangaDexSyncItems.status", "=", "DONE")
      .execute(),
  ])
  const importedIds = new Set(imported.map((item) => item.mangaDexId))
  const staffIds = new Map<string, string>()

  for (const staff of knownStaffs) {
    if (!staffIds.has(staff.name)) {
      staffIds.set(staff.name, staff.id)
    }
  }

  const knownGroupNames = new Set(knownGroups.map((group) => group.name))
  const existingTitles = new Set(current.titles.map((t) => `${t.language}:${lower(t.title)}`))
  const titles: Array<{ key: string; title: string; language: MediaLanguage; selected: boolean }> =
    []

  for (const [language, title] of [
    ...Object.entries(manga.title),
    ...manga.altTitles.map((alt) => [alt.language, alt.title] as const),
  ]) {
    const mapped = toMediaLanguage(language)
    const trimmed = title.trim().slice(0, config.input.maxNameLength)
    const key = `${mapped}:${lower(trimmed)}`

    if (mapped !== null && trimmed !== "" && !existingTitles.has(key)) {
      existingTitles.add(key)
      titles.push({ key: `title:${key}`, title: trimmed, language: mapped, selected: true })
    }
  }

  const synopses = SUPPORTED_LANGUAGES.flatMap((language) => {
    const description = manga.description[toMangaDexLanguage(language)]
    const text = description === undefined ? "" : toSynopsis(description)

    return text === "" || (current.synopsis[language] ?? "") !== ""
      ? []
      : [{ key: `synopsis:${language}`, language, text, selected: true }]
  })
  const creditedStaff = new Set(current.staffs.map((staff) => `${staff.role}:${staff.staffId}`))
  const staff = manga.staff.flatMap((member) => {
    const staffId = staffIds.get(lower(member.name)) ?? null

    return staffId !== null && creditedStaff.has(`${member.role}:${staffId}`)
      ? []
      : [
          {
            key: `staff:${member.role}:${member.id}`,
            mangaDexId: member.id,
            name: member.name.trim(),
            role: member.role satisfies StaffRole,
            staffId,
            ...(staffId === null
              ? { bio: toBio(member.biography), links: toStaffLinks(member) }
              : {}),
            selected: true,
          },
        ]
  })
  const currentTags = new Set(current.tags.map((tag) => tag.key))
  const tags: Array<{ key: string; tag: string; name: string; selected: boolean }> = []
  const unmatchedTags: string[] = []

  for (const tag of manga.tags) {
    const tagKey = toTagKey(tag.name)

    if (tagKey === null) {
      unmatchedTags.push(tag.name)
    } else if (!currentTags.has(tagKey)) {
      currentTags.add(tagKey)
      tags.push({ key: `tag:${tagKey}`, tag: tagKey, name: tag.name, selected: true })
    }
  }

  const mangaDexLinks = toMediaLinks(manga.links)
  const links = MEDIA_LINK_KEYS.flatMap((link) => {
    const value = mangaDexLinks[link]

    return value === undefined || current.links[link] !== undefined
      ? []
      : [{ key: `link:${link}`, link, value, selected: true }]
  })
  const fields: Array<MediaFieldProposal & { key: string; selected: boolean }> = []
  const status = toMediaStatus(manga.status)
  const demography = toMediaDemography(manga.demographic)
  const contentRating = toContentRating(manga.contentRating)

  // Taiyō always has a status, demography and rating: a different MangaDex value is offered,
  // but left unticked. A missing start date is filled from MangaDex's year.
  if (status !== null && status !== current.status) {
    fields.push({
      key: "field:status",
      field: "status",
      current: current.status,
      proposed: status,
      selected: false,
    })
  }

  if (demography !== null && demography !== current.demography) {
    fields.push({
      key: "field:demography",
      field: "demography",
      current: current.demography,
      proposed: demography,
      selected: false,
    })
  }

  if (contentRating !== null && contentRating !== current.contentRating) {
    fields.push({
      key: "field:contentRating",
      field: "contentRating",
      current: current.contentRating,
      proposed: contentRating,
      selected: false,
    })
  }

  if (manga.year !== null && current.startDate === null) {
    fields.push({
      key: "field:startDate",
      field: "startDate",
      current: null,
      proposed: new Date(Date.UTC(manga.year, 0, 1)).toISOString(),
      selected: true,
    })
  }

  const existingCovers = new Set(covers.map((cover) => `${cover.language}:${cover.volume ?? ""}`))
  const coverItems = mangaDexCovers.flatMap((cover) => {
    const language = toMediaLanguage(cover.locale)
    const volume = toVolume(cover.volume)
    const key = `${language}:${volume ?? ""}`

    if (language === null || importedIds.has(cover.id) || existingCovers.has(key)) {
      return []
    }

    existingCovers.add(key)

    return [
      {
        key: `cover:${cover.id}`,
        mangaDexId: cover.id,
        volume,
        language,
        fileName: cover.fileName,
        selected: true,
      },
    ]
  })
  const existingChapters = new Map<string, string[][]>()

  for (const chapter of chapters) {
    const key = chapterKey(chapter.language, chapter.number)

    existingChapters.set(key, [...(existingChapters.get(key) ?? []), chapter.groups])
  }

  const plannedChapters = new Map<string, string[][]>()
  // A chapter of the same number and language is the same release when they share a group, or
  // when either side credits none.
  const isSameRelease = (releases: string[][] | undefined, names: Set<string>) =>
    (releases ?? []).some(
      (groups) => groups.length === 0 || names.size === 0 || groups.some((g) => names.has(g)),
    )
  let skippedChapters = 0
  const chapterItems = mangaDexChapters
    .flatMap((chapter) => {
      const language: SupportedLanguage | null = toSupportedLanguage(chapter.language)
      const number = toChapterNumber(chapter.chapter, chapter.volume)
      const isExternal = chapter.externalUrl !== null

      if (
        language === null ||
        number === null ||
        chapter.isUnavailable ||
        (isExternal && toExternalUrl(chapter.externalUrl) === null) ||
        (!isExternal && (chapter.pages === 0 || chapter.pages > config.images.maxChapterPages)) ||
        new Date(chapter.publishedAt) > new Date()
      ) {
        skippedChapters++

        return []
      }

      const names = new Set(chapter.groups.map((group) => lower(group.name)))
      const key = chapterKey(language, number)

      if (isSameRelease(existingChapters.get(key), names) || importedIds.has(chapter.id)) {
        return []
      }

      if (isSameRelease(plannedChapters.get(key), names)) {
        skippedChapters++

        return []
      }

      plannedChapters.set(key, [...(plannedChapters.get(key) ?? []), [...names]])

      return [
        {
          key: `chapter:${chapter.id}`,
          mangaDexId: chapter.id,
          number,
          volume: toVolume(chapter.volume),
          title: chapter.title,
          language,
          pages: chapter.pages,
          isExternal,
          publishedAt: new Date(chapter.publishedAt).toISOString(),
          groups: chapter.groups.map((group) => ({
            name: group.name.trim(),
            exists: knownGroupNames.has(lower(group.name)),
          })),
          selected: true,
        },
      ]
    })
    .sort((a, b) => a.language.localeCompare(b.language) || a.number - b.number)

  return {
    mangaDex: {
      id: manga.id,
      title:
        manga.title.en ??
        Object.values(manga.title)[0] ??
        manga.altTitles.find((alt) => alt.language === "en")?.title ??
        "",
    },
    titles,
    synopses,
    staff,
    tags,
    unmatchedTags,
    links,
    fields,
    covers: coverItems,
    chapters: chapterItems,
    skippedChapters,
  }
}

export type MangaDexPlan = Awaited<ReturnType<typeof buildMangaDexPlan>>

export const applyMangaDexPlan = async (
  db: Kysely<DB>,
  {
    mediaId,
    userId,
    mangaDexId,
    plan,
    keys,
  }: {
    mediaId: string
    userId: string
    mangaDexId: string
    plan: MangaDexPlan
    keys: ReadonlySet<string>
  },
) => {
  const pick = <T extends { key: string }>(items: T[]) => items.filter((item) => keys.has(item.key))
  const current = await readMediaEdit(db, mediaId)
  const proposed: MediaEdit = {}
  const titles = pick(plan.titles)
  const synopses = pick(plan.synopses).filter((s) => (current.synopsis[s.language] ?? "") === "")
  const tags = pick(plan.tags)
  const links = pick(plan.links)
  const fields = pick(plan.fields)
  const staff = pick(plan.staff)

  if (titles.length > 0) {
    const hasMainTitle = current.titles.some((title) => title.isMainTitle)

    proposed.titles = [
      ...current.titles,
      ...titles.map((title, index) => ({
        title: title.title,
        language: title.language,
        isAcronym: false,
        isMainTitle: !hasMainTitle && index === 0,
      })),
    ]
      .filter(
        (title, index, all) =>
          all.findIndex(
            (other) =>
              other.language === title.language && lower(other.title) === lower(title.title),
          ) === index,
      )
      .slice(0, config.input.maxMediaTitles)
  }

  if (synopses.length > 0) {
    proposed.synopsis = {
      ...current.synopsis,
      ...Object.fromEntries(synopses.map((synopsis) => [synopsis.language, synopsis.text])),
    }
  }

  if (tags.length > 0) {
    const currentKeys = new Set(current.tags.map((tag) => tag.key))

    proposed.tags = [
      ...current.tags,
      ...tags
        .filter((tag) => !currentKeys.has(tag.tag))
        .map((tag) => ({ key: tag.tag, isSpoiler: false })),
    ].slice(0, config.input.maxMediaTags)
  }

  const mergedLinks = {
    ...(Object.fromEntries(links.map((link) => [link.link, link.value])) as MediaLinks),
    ...current.links,
    mangaDex: current.links.mangaDex ?? mangaDexId,
  }

  if (Object.keys(mergedLinks).length !== Object.keys(current.links).length) {
    proposed.links = mergedLinks
  }

  for (const field of fields) {
    if (field.field === "status") {
      proposed.status = field.proposed
    } else if (field.field === "demography") {
      proposed.demography = field.proposed
    } else if (field.field === "contentRating") {
      proposed.contentRating = field.proposed
    } else if (current.startDate === null) {
      proposed.startDate = field.proposed
    }
  }

  if (staff.length > 0) {
    const credits = [...current.staffs]

    for (const member of staff) {
      let staffId = member.staffId

      if (staffId === null) {
        const found = await db
          .selectFrom("staffs")
          .select("id")
          .where(sql<string>`lower("name")`, "=", lower(member.name))
          .where("deletedAt", "is", null)
          .orderBy("createdAt")
          .executeTakeFirst()

        staffId =
          found?.id ??
          (
            await db
              .insertInto("staffs")
              .values({
                name: member.name.slice(0, config.input.maxNameLength),
                bio: member.bio ?? {},
                links: member.links ?? {},
                creatorId: userId,
              })
              .returning("id")
              .executeTakeFirstOrThrow()
          ).id
      }

      credits.push({ staffId, role: member.role })
    }

    proposed.staffs = credits.slice(0, config.input.maxMediaStaffs)
  }

  const edit = diffMediaEdit(current, normalizeMediaEdit(proposed))
  const error = await checkMediaEdit(db, mediaId, edit)

  if (error !== null) {
    return { error }
  }

  await applyMediaEdit(db, { mediaId, actorId: userId, edit })

  const summary: MangaDexSyncSummary = {
    ...(edit.titles === undefined ? {} : { titles: titles.length }),
    ...(edit.synopsis === undefined ? {} : { synopses: synopses.length }),
    ...(edit.staffs === undefined ? {} : { staff: staff.length }),
    ...(edit.tags === undefined ? {} : { tags: tags.length }),
    ...(links.length === 0 ? {} : { links: links.length }),
    ...(fields.length === 0 ? {} : { fields: fields.length }),
  }
  const items = [
    ...pick(plan.covers).map((cover) => ({
      kind: "COVER" as const,
      mangaDexId: cover.mangaDexId,
      details: { language: cover.language, volume: cover.volume } satisfies MangaDexSyncItemDetails,
    })),
    ...pick(plan.chapters).map((chapter) => ({
      kind: "CHAPTER" as const,
      mangaDexId: chapter.mangaDexId,
      details: {
        language: chapter.language,
        volume: chapter.volume,
        number: chapter.number,
        title: chapter.title,
        groups: chapter.groups.map((group) => group.name),
      } satisfies MangaDexSyncItemDetails,
    })),
  ]

  return { error: null, current, edit, summary, items }
}

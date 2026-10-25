import { config } from "@taiyomoe/config"
import {
  type DB,
  type Kysely,
  LANGUAGES,
  type LocalizedText,
  MEDIA_COUNTRIES_OF_ORIGIN,
  MEDIA_DEMOGRAPHIES,
  MEDIA_EDIT_FIELDS,
  MEDIA_SOURCES,
  MEDIA_STATUSES,
  MEDIA_TYPES,
  type MediaEdit,
  type MediaEditField,
  type MediaEditStaff,
  type MediaEditTitle,
  type MediaLinks,
  type MediaTags,
  STAFF_ROLES,
  sql,
} from "@taiyomoe/db"
import z from "zod"
import {
  contentRatingSchema,
  languageSchema,
  mediaLinksSchema,
  mediaSynopsisSchema,
  mediaTagsSchema,
} from "./schemas"

const titleKey = (title: Pick<MediaEditTitle, "language" | "title">) =>
  `${title.language}:${title.title.toLowerCase()}`
const mediaEditTitleSchema = z.object({
  title: z.string().trim().min(1).max(config.input.maxNameLength).meta({
    description: "The title in the given language.",
    example: "One Punch Man",
  }),
  language: languageSchema("The language of the title."),
  isAcronym: z.boolean().default(false).meta({ description: "Whether the title is an acronym." }),
  isMainTitle: z
    .boolean()
    .default(false)
    .meta({ description: "Whether this is the main title of the media." }),
})
const mediaEditStaffSchema = z.object({
  staffId: z.uuid().meta({ description: "The ID of the staff member." }),
  role: z.enum(STAFF_ROLES).meta({ description: "The staff member's role.", example: "AUTHOR" }),
})

export const mediaEditSchema = z.object({
  titles: mediaEditTitleSchema
    .array()
    .min(1)
    .max(config.input.maxMediaTitles)
    .refine((titles) => titles.filter((title) => title.isMainTitle).length === 1, {
      message: "Exactly one title must be the main title.",
    })
    .refine((titles) => new Set(titles.map(titleKey)).size === titles.length, {
      message: "A title can only be listed once per language.",
    })
    .exactOptional()
    .meta({
      description:
        "Every title of the media, replacing the current ones. Titles of the same language are ranked in the order given.",
    }),
  synopsis: mediaSynopsisSchema.exactOptional(),
  type: z.enum(MEDIA_TYPES).exactOptional().meta({ description: "The type of the media." }),
  status: z.enum(MEDIA_STATUSES).exactOptional().meta({
    description: "The current release status of the media.",
    example: "RELEASING",
  }),
  source: z.enum(MEDIA_SOURCES).exactOptional().meta({
    description: "The original source of the media.",
    example: "ORIGINAL",
  }),
  demography: z.enum(MEDIA_DEMOGRAPHIES).exactOptional().meta({
    description: "The target audience of the media.",
    example: "SHOUNEN",
  }),
  countryOfOrigin: z.enum(MEDIA_COUNTRIES_OF_ORIGIN).exactOptional().meta({
    description: "The country where the media was originally created.",
    example: "JAPAN",
  }),
  contentRating: contentRatingSchema("The content rating of the media.").exactOptional(),
  startDate: z.iso
    .datetime()
    .nullable()
    .exactOptional()
    .meta({ description: "The release start date, or null to clear." }),
  endDate: z.iso
    .datetime()
    .nullable()
    .exactOptional()
    .meta({ description: "The release end date, or null to clear." }),
  tags: mediaTagsSchema
    .max(config.input.maxMediaTags)
    .refine((tags) => new Set(tags.map((tag) => tag.key)).size === tags.length, {
      message: "A tag can only be listed once.",
    })
    .exactOptional(),
  links: mediaLinksSchema.exactOptional(),
  staffs: mediaEditStaffSchema
    .array()
    .max(config.input.maxMediaStaffs)
    .exactOptional()
    .meta({ description: "Every staff credit of the media, replacing the current ones." }),
})

const mediaEditStaffViewSchema = mediaEditStaffSchema.extend({
  name: z.string().meta({ description: "The name of the staff member.", example: "ONE" }),
})

export const mediaEditViewSchema = mediaEditSchema.extend({
  staffs: mediaEditStaffViewSchema.array().exactOptional(),
})

export const mediaEditFieldSchema = z.enum(MEDIA_EDIT_FIELDS)

type MediaEditView = Omit<MediaEdit, "staffs"> & {
  staffs?: Array<MediaEditStaff & { name: string }>
}

const compactSynopsis = (synopsis: LocalizedText) =>
  Object.fromEntries(
    LANGUAGES.flatMap((language) => {
      const text = synopsis[language]?.trim()

      return text === undefined || text === "" ? [] : [[language, text]]
    }),
  )
const normalizeTags = (tags: MediaTags[]) =>
  tags.map((tag) => ({ key: tag.key, isSpoiler: tag.isSpoiler }))
const rankTitles = (titles: MediaEditTitle[]) =>
  titles
    .map((title, index) => ({ title, index }))
    .sort(
      (a, b) =>
        Number(b.title.isMainTitle) - Number(a.title.isMainTitle) ||
        (a.title.language < b.title.language ? -1 : Number(a.title.language > b.title.language)) ||
        a.index - b.index,
    )
    .map(({ title }) => ({
      title: title.title.trim(),
      language: title.language,
      isAcronym: title.isAcronym,
      isMainTitle: title.isMainTitle,
    }))
const sortStaffs = (staffs: MediaEditStaff[]) =>
  [...new Map(staffs.map((staff) => [`${staff.role}:${staff.staffId}`, staff])).entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([, staff]) => ({ staffId: staff.staffId, role: staff.role }))
const toIsoDate = (value: string | null) => (value === null ? null : new Date(value).toISOString())

export const normalizeMediaEdit = (edit: MediaEdit) => {
  const normalized: MediaEdit = { ...edit }

  if (edit.titles !== undefined) {
    normalized.titles = rankTitles(edit.titles)
  }

  if (edit.synopsis !== undefined) {
    normalized.synopsis = compactSynopsis(edit.synopsis)
  }

  if (edit.tags !== undefined) {
    normalized.tags = normalizeTags(edit.tags)
  }

  if (edit.staffs !== undefined) {
    normalized.staffs = sortStaffs(edit.staffs)
  }

  if (edit.startDate !== undefined) {
    normalized.startDate = toIsoDate(edit.startDate)
  }

  if (edit.endDate !== undefined) {
    normalized.endDate = toIsoDate(edit.endDate)
  }

  return normalized
}

const stable = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(stable)
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([key, inner]) => [key, stable(inner)]),
    )
  }

  return value
}

export const sameValue = (a: unknown, b: unknown) =>
  JSON.stringify(stable(a) ?? null) === JSON.stringify(stable(b) ?? null)

export const editedFields = (edit: MediaEdit) =>
  MEDIA_EDIT_FIELDS.filter((field) => edit[field] !== undefined)

export const pickFields = (edit: MediaEdit, fields: readonly MediaEditField[]) => {
  const picked: MediaEdit = Object.fromEntries(fields.map((field) => [field, edit[field]]))

  return picked
}

export const diffMediaEdit = (current: MediaEdit, proposed: MediaEdit) =>
  pickFields(
    proposed,
    editedFields(proposed).filter((field) => !sameValue(current[field], proposed[field])),
  )

const isoTimestamp = (column: "startDate" | "endDate") =>
  sql<string | null>`to_char(${sql.ref(`medias.${column}`)}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as(
    column,
  )

export const readMediaEdits = async (db: Kysely<DB>, mediaIds: readonly string[]) => {
  if (mediaIds.length === 0) {
    return new Map<string, Required<MediaEdit>>()
  }

  const [medias, titles, staffs] = await Promise.all([
    db
      .selectFrom("medias")
      .select([
        "id",
        "type",
        "status",
        "source",
        "demography",
        "countryOfOrigin",
        "contentRating",
        "synopsis",
        "tags",
        "links",
        isoTimestamp("startDate"),
        isoTimestamp("endDate"),
      ])
      .where("id", "in", mediaIds)
      .execute(),
    db
      .selectFrom("titles")
      .select(["mediaId", "title", "language", "isAcronym", "isMainTitle"])
      .where("mediaId", "in", mediaIds)
      .where("deletedAt", "is", null)
      .orderBy("priority")
      .orderBy("createdAt")
      .execute(),
    db
      .selectFrom("mediaStaffs")
      .innerJoin("staffs", "staffs.id", "mediaStaffs.staffId")
      .select(["mediaStaffs.mediaId", "mediaStaffs.staffId", "mediaStaffs.role"])
      .where("mediaStaffs.mediaId", "in", mediaIds)
      .where("staffs.deletedAt", "is", null)
      .execute(),
  ])

  return new Map(
    medias.map(
      (media) =>
        [
          media.id,
          {
            titles: rankTitles(titles.filter((title) => title.mediaId === media.id)),
            synopsis: compactSynopsis(media.synopsis),
            type: media.type,
            status: media.status,
            source: media.source,
            demography: media.demography,
            countryOfOrigin: media.countryOfOrigin,
            contentRating: media.contentRating,
            startDate: media.startDate,
            endDate: media.endDate,
            tags: normalizeTags(media.tags ?? []),
            links: media.links,
            staffs: sortStaffs(staffs.filter((staff) => staff.mediaId === media.id)),
          },
        ] satisfies [string, Required<MediaEdit>],
    ),
  )
}

export const readMediaEdit = async (db: Kysely<DB>, mediaId: string) => {
  const edit = (await readMediaEdits(db, [mediaId])).get(mediaId)

  if (edit === undefined) {
    throw new Error(`Media ${mediaId} not found`)
  }

  return edit
}

export const withStaffNames = async (db: Kysely<DB>, edits: MediaEdit[]) => {
  const staffIds = [...new Set(edits.flatMap((edit) => (edit.staffs ?? []).map((s) => s.staffId)))]
  const rows =
    staffIds.length === 0
      ? []
      : await db.selectFrom("staffs").select(["id", "name"]).where("id", "in", staffIds).execute()
  const names = new Map(rows.map((row) => [row.id, row.name]))

  return edits.map(
    ({ staffs, ...rest }) =>
      ({
        ...rest,
        ...(staffs === undefined
          ? {}
          : {
              staffs: staffs.map((staff) => ({ ...staff, name: names.get(staff.staffId) ?? "" })),
            }),
      }) satisfies MediaEditView,
  )
}

export const lockMedia = (db: Kysely<DB>, mediaId: string) =>
  db
    .selectFrom("medias")
    .select("id")
    .where("id", "=", mediaId)
    .where("deletedAt", "is", null)
    .forUpdate()
    .executeTakeFirst()

type MediaEditError =
  | { code: "STAFF_NOT_FOUND" }
  | {
      code: "MEDIA_LINK_CONFLICT"
      details: { conflictingMediaId: string; providedLinks: MediaLinks }
    }

export const checkMediaEdit = async (db: Kysely<DB>, mediaId: string, edit: MediaEdit) => {
  if (edit.staffs !== undefined && edit.staffs.length > 0) {
    const staffIds = [...new Set(edit.staffs.map((staff) => staff.staffId))]
    const found = await db
      .selectFrom("staffs")
      .select("id")
      .where("id", "in", staffIds)
      .where("deletedAt", "is", null)
      .execute()

    if (found.length !== staffIds.length) {
      return { code: "STAFF_NOT_FOUND" } satisfies MediaEditError
    }
  }

  const links = Object.entries(edit.links ?? {})

  if (links.length > 0) {
    const existing = await db
      .selectFrom("medias")
      .select("id")
      .where("id", "!=", mediaId)
      .where((eb) =>
        eb.or(
          links.map(
            ([key, value]) => sql<boolean>`links @> ${JSON.stringify({ [key]: value })}::jsonb`,
          ),
        ),
      )
      .limit(1)
      .executeTakeFirst()

    if (existing) {
      return {
        code: "MEDIA_LINK_CONFLICT",
        details: { conflictingMediaId: existing.id, providedLinks: Object.fromEntries(links) },
      } satisfies MediaEditError
    }
  }

  return null
}

const toTimestamp = (value: string | null) =>
  value === null ? null : sql<Date>`${value}::timestamptz at time zone 'UTC'`

export const applyMediaEdit = async (
  db: Kysely<DB>,
  { mediaId, actorId, edit }: { mediaId: string; actorId: string; edit: MediaEdit },
) => {
  const updates = {
    ...(edit.type === undefined ? {} : { type: edit.type }),
    ...(edit.status === undefined ? {} : { status: edit.status }),
    ...(edit.source === undefined ? {} : { source: edit.source }),
    ...(edit.demography === undefined ? {} : { demography: edit.demography }),
    ...(edit.countryOfOrigin === undefined ? {} : { countryOfOrigin: edit.countryOfOrigin }),
    ...(edit.contentRating === undefined ? {} : { contentRating: edit.contentRating }),
    ...(edit.synopsis === undefined ? {} : { synopsis: edit.synopsis }),
    ...(edit.tags === undefined ? {} : { tags: edit.tags }),
    ...(edit.links === undefined ? {} : { links: edit.links }),
    ...(edit.startDate === undefined ? {} : { startDate: toTimestamp(edit.startDate) }),
    ...(edit.endDate === undefined ? {} : { endDate: toTimestamp(edit.endDate) }),
  }

  if (Object.keys(updates).length > 0) {
    await db.updateTable("medias").set(updates).where("id", "=", mediaId).execute()
  }

  if (edit.titles !== undefined) {
    const existing = await db
      .selectFrom("titles")
      .select(["id", "title", "language", "creatorId", "createdAt"])
      .where("mediaId", "=", mediaId)
      .where("deletedAt", "is", null)
      .execute()
    const reserved = await db
      .selectFrom("titles")
      .select(["language", sql<number>`max(priority)`.as("priority")])
      .where("mediaId", "=", mediaId)
      .where("deletedAt", "is not", null)
      .groupBy("language")
      .execute()
    const kept = new Map(existing.map((title) => [titleKey(title), title]))
    const ranks = new Map(reserved.map((row) => [row.language, row.priority]))

    await db
      .deleteFrom("titles")
      .where("mediaId", "=", mediaId)
      .where("deletedAt", "is", null)
      .execute()

    await db
      .insertInto("titles")
      .values(
        rankTitles(edit.titles).map((title) => {
          const priority = (ranks.get(title.language) ?? 0) + 1
          const previous = kept.get(titleKey(title))

          ranks.set(title.language, priority)

          return {
            ...(previous === undefined
              ? { creatorId: actorId }
              : { id: previous.id, creatorId: previous.creatorId, createdAt: previous.createdAt }),
            mediaId,
            title: title.title,
            language: title.language,
            isAcronym: title.isAcronym,
            isMainTitle: title.isMainTitle,
            priority,
          }
        }),
      )
      .execute()
  }

  if (edit.staffs !== undefined) {
    await db
      .deleteFrom("mediaStaffs")
      .where("mediaId", "=", mediaId)
      .where("staffId", "in", db.selectFrom("staffs").select("id").where("deletedAt", "is", null))
      .execute()

    if (edit.staffs.length > 0) {
      await db
        .insertInto("mediaStaffs")
        .values(sortStaffs(edit.staffs).map((staff) => ({ mediaId, ...staff })))
        .onConflict((oc) => oc.doNothing())
        .execute()
    }
  }
}

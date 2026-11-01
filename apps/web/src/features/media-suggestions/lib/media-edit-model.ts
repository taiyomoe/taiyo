import type { MediaEditField } from "@taiyomoe/db/constants"
import type {
  MediaEditChanges,
  MediaEditView,
} from "@/features/media-suggestions/api/media-suggestions"
import { m } from "@/paraglide/messages"

export type MediaEditDraft = { [K in MediaEditField]-?: Exclude<MediaEditView[K], undefined> }

export type MediaEditTitle = MediaEditDraft["titles"][number]

export type MediaEditStaff = MediaEditDraft["staffs"][number]

export const FIELD_LABELS: Record<MediaEditField, () => string> = {
  titles: m.media_edit_field_titles,
  synopsis: m.media_edit_field_synopsis,
  type: m.media_info_type,
  status: m.media_info_status,
  source: m.media_info_source,
  demography: m.media_info_demography,
  countryOfOrigin: m.media_info_country,
  contentRating: m.media_info_content_rating,
  startDate: m.media_edit_field_start_date,
  endDate: m.media_edit_field_end_date,
  tags: m.media_edit_field_tags,
  links: m.media_info_links,
  staffs: m.media_edit_field_staffs,
}

export const toDraft = (view: MediaEditView) =>
  ({
    titles: view.titles ?? [],
    synopsis: view.synopsis ?? {},
    type: view.type ?? "MANGA",
    status: view.status ?? "RELEASING",
    source: view.source ?? "ORIGINAL",
    demography: view.demography ?? "SHOUNEN",
    countryOfOrigin: view.countryOfOrigin ?? "JAPAN",
    contentRating: view.contentRating ?? "NORMAL",
    startDate: view.startDate ?? null,
    endDate: view.endDate ?? null,
    tags: view.tags ?? [],
    links: view.links ?? {},
    staffs: view.staffs ?? [],
  }) satisfies MediaEditDraft

const cleanSynopsis = (synopsis: MediaEditDraft["synopsis"]) =>
  Object.fromEntries(
    Object.entries(synopsis).flatMap(([language, text]) =>
      text === undefined || text.trim() === "" ? [] : [[language, text.trim()]],
    ),
  )
const cleanLinks = (links: MediaEditDraft["links"]) =>
  Object.fromEntries(
    Object.entries(links).filter(([, value]) => value !== undefined && value !== ""),
  )
const comparable = (field: MediaEditField, draft: MediaEditDraft) => {
  if (field === "titles") {
    return draft.titles.map((title) => ({ ...title, title: title.title.trim() }))
  }

  if (field === "synopsis") {
    return cleanSynopsis(draft.synopsis)
  }

  if (field === "links") {
    return cleanLinks(draft.links)
  }

  if (field === "staffs") {
    return draft.staffs.map(({ staffId, role }) => `${role}:${staffId}`).sort()
  }

  return draft[field]
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

export const sameField = (field: MediaEditField, a: MediaEditDraft, b: MediaEditDraft) =>
  JSON.stringify(stable(comparable(field, a))) === JSON.stringify(stable(comparable(field, b)))

export const toChanges = (draft: MediaEditDraft, fields: readonly MediaEditField[]) => {
  const has = (field: MediaEditField) => fields.includes(field)

  return {
    ...(has("titles")
      ? { titles: draft.titles.map((t) => ({ ...t, title: t.title.trim() })) }
      : {}),
    ...(has("synopsis") ? { synopsis: cleanSynopsis(draft.synopsis) } : {}),
    ...(has("type") ? { type: draft.type } : {}),
    ...(has("status") ? { status: draft.status } : {}),
    ...(has("source") ? { source: draft.source } : {}),
    ...(has("demography") ? { demography: draft.demography } : {}),
    ...(has("countryOfOrigin") ? { countryOfOrigin: draft.countryOfOrigin } : {}),
    ...(has("contentRating") ? { contentRating: draft.contentRating } : {}),
    ...(has("startDate") ? { startDate: draft.startDate } : {}),
    ...(has("endDate") ? { endDate: draft.endDate } : {}),
    ...(has("tags") ? { tags: draft.tags } : {}),
    ...(has("links") ? { links: cleanLinks(draft.links) } : {}),
    ...(has("staffs")
      ? { staffs: draft.staffs.map(({ staffId, role }) => ({ staffId, role })) }
      : {}),
  } satisfies MediaEditChanges
}

export const getTitlesError = (titles: readonly MediaEditTitle[]) => {
  if (titles.some((title) => title.title.trim() === "")) {
    return m.media_edit_titles_empty()
  }

  if (titles.filter((title) => title.isMainTitle).length !== 1) {
    return m.media_edit_titles_main()
  }

  const keys = titles.map((title) => `${title.language}:${title.title.trim().toLowerCase()}`)

  return new Set(keys).size === keys.length ? null : m.media_edit_titles_duplicate()
}

const HTTP_URL = /^https?:\/\/[^\s/$.?#].\S*$/i
const UUID = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i

export const getLinkError = (key: string, value: string | number | undefined) => {
  if (value === undefined || value === "" || typeof value === "number") {
    return null
  }

  if (key === "mangaDex") {
    return UUID.test(value) ? null : m.media_edit_link_uuid()
  }

  return HTTP_URL.test(value) ? null : m.media_edit_link_url()
}

export const getFieldsError = (draft: MediaEditDraft, fields: readonly MediaEditField[]) =>
  (fields.includes("titles") ? getTitlesError(draft.titles) : null) ??
  (fields.includes("links")
    ? (Object.entries(draft.links)
        .map(([key, value]) => getLinkError(key, value))
        .find((error) => error !== null) ?? null)
    : null)

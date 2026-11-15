import type { ContentRating, MediaLanguage } from "@taiyomoe/db/constants"
import type { MediaEditDraft } from "@/features/media-suggestions/lib/media-edit-model"

type NewMediaCover = {
  file: File
  volume: number | null
  language: MediaLanguage
  contentRating: ContentRating
  main: boolean
}

type NewMediaBanner = { file: File; contentRating: ContentRating }

export const buildMediaForm = (
  draft: MediaEditDraft,
  covers: readonly NewMediaCover[],
  banners: readonly NewMediaBanner[],
) => {
  const form = new FormData()
  const ranks = new Map<string, number>()
  const append = (key: string, value: string | number | boolean | File) => {
    form.append(key, value instanceof File ? value : String(value))
  }

  for (const [index, title] of draft.titles.entries()) {
    const priority = (ranks.get(title.language) ?? 0) + 1

    ranks.set(title.language, priority)
    append(`titles.${index}.title`, title.title.trim())
    append(`titles.${index}.language`, title.language)
    append(`titles.${index}.main`, title.isMainTitle)
    append(`titles.${index}.priority`, priority)
    append(`titles.${index}.isAcronym`, title.isAcronym)
  }

  for (const [language, text] of Object.entries(draft.synopsis)) {
    if (text !== undefined && text.trim() !== "") {
      append(`synopsis.${language}`, text.trim())
    }
  }

  for (const [index, cover] of covers.entries()) {
    append(`covers.${index}.file`, cover.file)
    append(`covers.${index}.language`, cover.language)
    append(`covers.${index}.contentRating`, cover.contentRating)
    append(`covers.${index}.main`, cover.main)

    if (cover.volume !== null) {
      append(`covers.${index}.volume`, cover.volume)
    }
  }

  for (const [index, banner] of banners.entries()) {
    append(`banners.${index}.file`, banner.file)
    append(`banners.${index}.contentRating`, banner.contentRating)
  }

  for (const [index, tag] of draft.tags.entries()) {
    append(`tags.${index}.key`, tag.key)
    append(`tags.${index}.isSpoiler`, tag.isSpoiler)
  }

  for (const [provider, value] of Object.entries(draft.links)) {
    if (value !== undefined && value !== "") {
      append(`links.${provider}`, value)
    }
  }

  for (const [index, staff] of draft.staffs.entries()) {
    append(`staffs.${index}.staffId`, staff.staffId)
    append(`staffs.${index}.role`, staff.role)
  }

  append("type", draft.type)
  append("status", draft.status)
  append("source", draft.source)
  append("demography", draft.demography)
  append("countryOfOrigin", draft.countryOfOrigin)
  append("contentRating", draft.contentRating)

  if (draft.startDate !== null) {
    append("startDate", draft.startDate)
  }

  if (draft.endDate !== null) {
    append("endDate", draft.endDate)
  }

  return form
}

export const getMediaImagesError = (
  covers: ReadonlyArray<{ main: boolean; volume: number | null | undefined }>,
) => {
  if (covers.length === 0) {
    return "missing-cover"
  }

  if (covers.some((cover) => cover.volume === undefined)) {
    return "invalid-volume"
  }

  return covers.filter((cover) => cover.main).length === 1 ? null : "main-cover"
}

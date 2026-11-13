import type { Media } from "@/features/media/api/medias"
import { getLanguageName } from "@/components/flags/language-flags"
import { NO_VOLUME, getVolumeName } from "@/features/media/lib/chapter-volumes"
import { m } from "@/paraglide/messages"

export type MediaCover = Media["covers"][number]

export type MediaBanner = Media["banners"][number]

export type CoverLanguage = MediaCover["language"]

export type VolumeGroup = { key: string; volume: string | null; covers: MediaCover[] }

const volumeOrder = (volume: string | null) => {
  if (volume === null) {
    return Number.POSITIVE_INFINITY
  }

  const number = Number(volume)

  return Number.isNaN(number) ? Number.MAX_SAFE_INTEGER : number
}

export const sortCovers = (covers: readonly MediaCover[]) =>
  [...covers].sort(
    (a, b) =>
      volumeOrder(a.volume) - volumeOrder(b.volume) ||
      (a.volume ?? "").localeCompare(b.volume ?? "") ||
      Number(b.isMainCover) - Number(a.isMainCover) ||
      getLanguageName(a.language).localeCompare(getLanguageName(b.language)),
  )

export const groupByVolume = (covers: readonly MediaCover[]) => {
  const groups = new Map<string, VolumeGroup>()

  for (const cover of covers) {
    const key = cover.volume ?? NO_VOLUME
    const group = groups.get(key) ?? { key, volume: cover.volume, covers: [] }

    group.covers.push(cover)
    groups.set(key, group)
  }

  return [...groups.values()]
}

export const getCoverLanguages = (covers: readonly MediaCover[]) => {
  const counts = new Map<CoverLanguage, number>()

  for (const cover of covers) {
    counts.set(cover.language, (counts.get(cover.language) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count || a.language.localeCompare(b.language))
}

export const getCoverLabel = (cover: MediaCover) =>
  cover.volume === null ? m.media_covers_untitled() : getVolumeName(cover.volume)

const sanitizeFileName = (name: string) =>
  name
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
const getExtension = (url: string) => /\.(\w+)(?:\?.*)?$/.exec(url)?.[1] ?? "jpg"

export const getCoverFileName = (title: string, cover: MediaCover) =>
  `${sanitizeFileName(
    `${title} - ${getCoverLabel(cover)} (${getLanguageName(cover.language)})`,
  )}.${getExtension(cover.url)}`

export const getBannerFileName = (title: string, banner: MediaBanner, index: number) =>
  `${sanitizeFileName(m.media_banners_file_name({ title, number: index + 1 }))}.${getExtension(banner.url)}`

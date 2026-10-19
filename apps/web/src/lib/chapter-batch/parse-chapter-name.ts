export type ParsedChapterName = {
  number: number | null
  volume: string | null
  title: string | null
}

const NUMBER = String.raw`(\d+(?:[.,]\d+)?)`
const VOLUME = new RegExp(
  String.raw`(?:^|[^\p{L}])(?:vol(?:ume)?|v|tome|tomo)\.?\s*${NUMBER}`,
  "iu",
)
const CHAPTER = new RegExp(
  String.raw`(?:^|[^\p{L}])(?:ch(?:apter|ap)?|cap(?:[ií]tulo)?|chapitre|c|ep(?:isode)?|#)\.?\s*${NUMBER}`,
  "iu",
)
const STANDALONE_NUMBER = /(?<![\p{L}\d.,])(\d+(?:[.,]\d+)?)(?![\p{L}\d])/gu
const TAGS = /\[[^\]]*\]|\([^)]*\)|\{[^}]*\}/g
const TITLE = /^[\s\-–—:|.]*[-–—:|]\s*(.+)$/u
const toNumber = (value: string | undefined) => {
  const number = Number((value ?? "").replace(",", "."))

  return Number.isFinite(number) ? number : null
}
const toTitle = (rest: string) => {
  const title = TITLE.exec(rest.replace(TAGS, " "))?.[1]?.replace(/\s+/g, " ").trim()

  return title === undefined || title === "" ? null : title
}

export const parseChapterName = (raw: string): ParsedChapterName => {
  const name = raw
    .split("/")
    .map((segment) => segment.replace(/\.(?:zip|cbz)$/i, ""))
    .join("/")
    .replace(/_/g, " ")
    .trim()
  const volumeMatch = VOLUME.exec(name)
  const volume = volumeMatch === null ? null : String(toNumber(volumeMatch[1]))
  const chapterMatch = CHAPTER.exec(name)

  if (chapterMatch !== null) {
    return {
      number: toNumber(chapterMatch[1]),
      volume,
      title: toTitle(name.slice(chapterMatch.index + chapterMatch[0].length).split("/")[0] ?? ""),
    }
  }

  const withoutVolume = volumeMatch === null ? name : name.replace(volumeMatch[0], " ")
  const cleaned = withoutVolume.replace(TAGS, (tag) => " ".repeat(tag.length))
  const last = [...cleaned.matchAll(STANDALONE_NUMBER)].at(-1)

  if (last === undefined) {
    return { number: null, volume, title: null }
  }

  return {
    number: toNumber(last[1]),
    volume,
    title: toTitle(withoutVolume.slice(last.index + last[0].length).split("/")[0] ?? ""),
  }
}

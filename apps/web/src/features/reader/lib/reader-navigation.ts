import type { ReaderChapter } from "@/features/reader/api/reader"

type NavigableChapter = Pick<ReaderChapter, "id" | "number" | "language" | "isExternal" | "groups">

const sharesGroup = (a: NavigableChapter, b: NavigableChapter) =>
  a.groups.some((group) => b.groups.some((other) => other.id === group.id))
const pickVersion = <T extends NavigableChapter>(
  candidates: readonly T[],
  current: NavigableChapter,
) =>
  candidates.find((candidate) => sharesGroup(candidate, current)) ??
  candidates.find((candidate) => !candidate.isExternal) ??
  candidates[0] ??
  null

export const getAdjacentChapter = <T extends NavigableChapter>(
  chapters: readonly T[],
  current: NavigableChapter,
  direction: "prev" | "next",
) => {
  const candidates = chapters.filter(
    (chapter) =>
      chapter.language === current.language &&
      (direction === "next" ? chapter.number > current.number : chapter.number < current.number),
  )

  if (candidates.length === 0) {
    return null
  }

  const numbers = candidates.map((chapter) => chapter.number)
  const target = direction === "next" ? Math.min(...numbers) : Math.max(...numbers)

  return pickVersion(
    candidates.filter((chapter) => chapter.number === target),
    current,
  )
}

export const getChapterVersions = <T extends NavigableChapter>(
  chapters: readonly T[],
  current: NavigableChapter,
) =>
  chapters
    .filter((chapter) => chapter.number === current.number)
    .sort(
      (a, b) => Number(b.language === current.language) - Number(a.language === current.language),
    )

export const getChapterChoices = <T extends NavigableChapter>(
  chapters: readonly T[],
  current: NavigableChapter,
) => {
  const byNumber = new Map<number, T[]>()

  for (const chapter of chapters) {
    if (chapter.language === current.language) {
      byNumber.set(chapter.number, [...(byNumber.get(chapter.number) ?? []), chapter])
    }
  }

  return [...byNumber.values()]
    .map((versions) =>
      versions.some((version) => version.id === current.id)
        ? (versions.find((version) => version.id === current.id) ?? versions[0])
        : pickVersion(versions, current),
    )
    .filter((chapter) => chapter !== null && chapter !== undefined)
    .sort((a, b) => b.number - a.number)
}

export const hasChapterGap = (from: number, to: number) =>
  Math.abs(Math.floor(to) - Math.floor(from)) > 1

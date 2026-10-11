type ChapterRef = { id: string; number: number; language: string }

export const getAdjacentChapters = <TChapter extends ChapterRef>(
  chapters: TChapter[],
  current: ChapterRef,
) => {
  let previous: TChapter | null = null
  let next: TChapter | null = null

  for (const chapter of chapters) {
    if (chapter.id === current.id || chapter.language !== current.language) {
      continue
    }

    if (chapter.number < current.number && (!previous || chapter.number > previous.number)) {
      previous = chapter
    }

    if (chapter.number > current.number && (!next || chapter.number < next.number)) {
      next = chapter
    }
  }

  return { previous, next }
}

type Props = {
  chapter: { title: string | null; number: number }
}

export const ChapterTitle = ({ chapter }: Props) => (
  <p className="line-clamp-1">
    Capítulo <span className="font-medium">{chapter.number}</span>
    {chapter.title && ` — ${chapter.title}`}
  </p>
)

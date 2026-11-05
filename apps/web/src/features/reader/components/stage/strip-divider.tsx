import * as stylex from "@stylexjs/stylex"
import { font } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  divider: {
    gap: "0.375rem",
    paddingBlock: "4rem",
    paddingInline: "1rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
  },
  end: {
    margin: 0,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    letterSpacing: "0.08em",
    opacity: 0.56,
    textTransform: "uppercase",
  },
  next: {
    margin: 0,
    fontSize: "1.125rem",
    fontWeight: 600,
  },
  title: {
    margin: 0,
    fontSize: "0.875rem",
    opacity: 0.72,
  },
})

export function StripDivider({
  register,
  chapterId,
  page,
  previousLabel,
  label,
  title,
}: {
  register: (element: HTMLElement | null) => void
  chapterId: string
  page: number
  previousLabel: string
  label: string
  title: string | null
}) {
  return (
    <div data-chapter={chapterId} data-page={page} ref={register} sx={styles.divider}>
      <p sx={styles.end}>{m.reader_divider_end({ chapter: previousLabel })}</p>
      <p sx={styles.next}>{label}</p>
      {title === null ? null : <p sx={styles.title}>{title}</p>}
    </div>
  )
}

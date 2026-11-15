import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { Cover } from "@/features/media/components/cover"

const styles = stylex.create({
  heading: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
  },
  cover: {
    flexShrink: 0,
    width: "3.5rem",
  },
  headingText: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  eyebrow: {
    margin: 0,
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  title: {
    margin: 0,
    color: colors.foreground,
    fontFamily: font.heading,
    fontSize: "1.375rem",
    fontWeight: font.weightBold,
    letterSpacing: "-0.015em",
  },
})

export function ChapterSourceHeading({
  coverUrl,
  mediaTitle,
  label,
  title,
}: {
  coverUrl: string | null
  mediaTitle: string
  label: string
  title: string
}) {
  return (
    <div sx={styles.heading}>
      <Cover src={coverUrl} sx={styles.cover} />
      <div sx={styles.headingText}>
        <p sx={styles.eyebrow}>
          {mediaTitle} · {label}
        </p>
        <h1 sx={styles.title}>{title}</h1>
      </div>
    </div>
  )
}

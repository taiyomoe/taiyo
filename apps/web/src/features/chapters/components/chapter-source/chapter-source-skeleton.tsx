import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  card: {
    padding: "1.25rem",
    borderColor: colors.border,
    borderRadius: radius.xxxl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "1.25rem",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    display: "flex",
    flexDirection: "column",
    maxWidth: "34rem",
    width: "100%",
  },
  heading: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
  },
  cover: {
    borderRadius: radius.md,
    aspectRatio: "2 / 3",
    flexShrink: 0,
    width: "3.5rem",
  },
  headingText: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  eyebrow: {
    height: "0.875rem",
    width: "45%",
  },
  title: {
    height: "1.625rem",
    width: "75%",
  },
  text: {
    height: "2.75rem",
  },
  button: {
    borderRadius: "999px",
    height: { default: "2.25rem", [breakpoints.sm]: "2rem" },
    width: "6rem",
  },
})

export function ChapterSourceSkeleton() {
  return (
    <div aria-hidden sx={styles.card}>
      <div sx={styles.heading}>
        <Skeleton sx={styles.cover} />
        <div sx={styles.headingText}>
          <Skeleton sx={styles.eyebrow} />
          <Skeleton sx={styles.title} />
        </div>
      </div>
      <Skeleton sx={styles.text} />
      <Skeleton sx={styles.button} />
    </div>
  )
}

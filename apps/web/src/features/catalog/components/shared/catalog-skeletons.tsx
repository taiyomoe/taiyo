import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { mediaCellStyles } from "@/features/catalog/components/shared/media-cell"
import { type CatalogBreakpoint, catalogHiddenFrom } from "@/features/catalog/lib/catalog-styles"

// Every placeholder takes the box of what it stands for: the same image sizes, and text
// lines one line-height (`1lh`) tall in the same typography, so a loaded row keeps its height.
const styles = stylex.create({
  line: {
    alignItems: "center",
    display: "flex",
    height: "1lh",
  },
  bar: {
    borderRadius: "999px",
    height: "0.7em",
  },
  banner: {
    borderRadius: "0.375rem",
    aspectRatio: "16 / 5",
    flexShrink: 0,
    width: "6.5rem",
  },
  pill: {
    borderRadius: "999px",
    height: "1.5rem",
  },
  icon: {
    borderRadius: "999px",
    flexShrink: 0,
    height: "1rem",
    width: "1rem",
  },
  avatar: {
    borderRadius: "999px",
    flexShrink: 0,
    height: "1.375rem",
    width: "1.375rem",
  },
  grow: {
    flexGrow: 1,
  },
  row: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  stack: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
  },
  actions: {
    borderRadius: "999px",
    marginInlineStart: "auto",
    height: "1.75rem",
    width: "1.75rem",
  },
  checkbox: {
    borderRadius: "0.25rem",
    height: "1rem",
    width: "1rem",
  },
})
const thumbStyles = stylex.create({
  cover: {
    borderRadius: "0.375rem",
    aspectRatio: "2 / 3",
    flexShrink: 0,
    width: "2.25rem",
  },
  avatar: {
    borderRadius: "999px",
    flexShrink: 0,
    height: "2.25rem",
    width: "2.25rem",
  },
  logo: {
    borderRadius: "0.5rem",
    flexShrink: 0,
    height: "2.25rem",
    width: "2.25rem",
  },
})
const Bar = ({ width }: { width: string }) => <Skeleton style={{ width }} sx={styles.bar} />

/** A text line of the given width, as tall as the line it stands for. */
export function SkeletonText({ width = "4rem" }: { width?: string }) {
  return (
    <span sx={styles.line}>
      <Bar width={width} />
    </span>
  )
}

/** The title cell: thumbnail, title and detail lines, and the folded details of narrow tables. */
export function SkeletonMediaCell({
  thumb,
  narrow,
}: {
  thumb: "cover" | "avatar" | "logo" | "none"
  narrow?: { from: CatalogBreakpoint; content: "pills" | "banner" } | undefined
}) {
  return (
    <div sx={mediaCellStyles.cell}>
      {thumb === "none" ? null : <Skeleton sx={thumbStyles[thumb]} />}
      <div sx={[mediaCellStyles.text, styles.grow]}>
        <span sx={[mediaCellStyles.title, styles.line]}>
          <Bar width="min(12rem, 80%)" />
        </span>
        <span sx={[mediaCellStyles.detail, styles.line]}>
          <Bar width="min(5rem, 50%)" />
        </span>
        {narrow === undefined ? null : (
          <div sx={[mediaCellStyles.narrow, catalogHiddenFrom[narrow.from]]}>
            {narrow.content === "banner" ? (
              <Skeleton sx={styles.banner} />
            ) : (
              <>
                <Skeleton style={{ width: "4.5rem" }} sx={styles.pill} />
                <Skeleton style={{ width: "2.75rem" }} sx={styles.pill} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function SkeletonBanner() {
  return <Skeleton sx={styles.banner} />
}

/** A badge or a language chip. */
export function SkeletonPill({ width = "4.5rem" }: { width?: string }) {
  return <Skeleton style={{ width }} sx={styles.pill} />
}

/** An icon followed by a label, like a content rating. */
export function SkeletonIconText({ width = "4.5rem" }: { width?: string }) {
  return (
    <span sx={styles.row}>
      <Skeleton sx={styles.icon} />
      <SkeletonText width={width} />
    </span>
  )
}

/** An avatar followed by a name, once per line. */
export function SkeletonUsers({ count = 1 }: { count?: number }) {
  return (
    <span sx={styles.stack}>
      {Array.from({ length: count }, (_, index) => (
        <span key={index} sx={styles.row}>
          <Skeleton sx={styles.avatar} />
          <SkeletonText width={index === 0 ? "5rem" : "4rem"} />
        </span>
      ))}
    </span>
  )
}

export function SkeletonActions() {
  return <Skeleton sx={styles.actions} />
}

export function SkeletonCheckbox() {
  return <Skeleton sx={styles.checkbox} />
}

import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Book } from "@taiyomoe/ui/components/icons"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, consts, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useImageLoaded } from "@/hooks/use-image-loaded"

const styles = stylex.create({
  frame: {
    borderRadius: radius.lg,
    overflow: "hidden",
    aspectRatio: "2 / 3",
    display: "block",
    flexShrink: 0,
    isolation: "isolate",
    position: "relative",
  },
  fill: {
    inset: 0,
    borderRadius: 0,
    position: "absolute",
  },
  image: {
    inset: 0,
    display: "block",
    objectFit: "cover",
    opacity: {
      "[data-loaded]": 1,
      default: 0,
    },
    position: "absolute",
    transform: {
      default: "scale(1)",
      ":is(:focus-visible > * > *)": "scale(1.07)",
      ":is(:hover > *)": "scale(1.07)",
    },
    transitionDuration: {
      default: "700ms, 200ms",
      [consts.reducedMotion]: "0s",
    },
    transitionProperty: "transform, opacity",
    transitionTimingFunction: motion.easeOut,
    height: "100%",
    width: "100%",
  },
  placeholder: {
    inset: 0,
    alignItems: "center",
    backgroundColor: colors.well,
    color: colors.mutedForeground,
    display: "flex",
    justifyContent: "center",
    position: "absolute",
  },
  placeholderIcon: {
    opacity: 0.6,
    height: "auto",
    width: "28%",
  },
})

type CoverProps = {
  src: string | null
  alt?: string
  priority?: "high" | "low" | "auto"
  /** Shown instead of the book placeholder when there is no cover or it fails to load. */
  fallback?: ReactNode
  sx?: Sx
}

export function Cover({ src, alt = "", priority = "auto", fallback, sx }: CoverProps) {
  const placeholder = fallback ?? <CoverPlaceholder />

  return (
    <span sx={[styles.frame, sx]}>
      {src === null ? (
        placeholder
      ) : (
        <CoverImage alt={alt} fallback={placeholder} priority={priority} src={src} />
      )}
    </span>
  )
}

export function CoverSkeleton({ sx }: { sx?: Sx }) {
  return (
    <span sx={[styles.frame, sx]}>
      <Skeleton sx={styles.fill} />
    </span>
  )
}

function CoverPlaceholder() {
  return (
    <span aria-hidden sx={styles.placeholder}>
      <Book {...stylex.props(styles.placeholderIcon)} />
    </span>
  )
}

function CoverImage({
  src,
  alt,
  priority,
  fallback,
}: {
  src: string
  alt: string
  priority: CoverProps["priority"]
  fallback: ReactNode
}) {
  const { loaded, failed, ref, onLoad, onError } = useImageLoaded()

  if (failed) {
    return fallback
  }

  return (
    <>
      {loaded ? null : <Skeleton sx={styles.fill} />}
      <img
        ref={ref}
        alt={alt}
        data-loaded={loaded ? "" : undefined}
        decoding={priority === "high" ? "sync" : "async"}
        draggable={false}
        fetchPriority={priority}
        loading={priority === "high" ? "eager" : "lazy"}
        onError={onError}
        onLoad={onLoad}
        src={src}
        sx={styles.image}
      />
    </>
  )
}

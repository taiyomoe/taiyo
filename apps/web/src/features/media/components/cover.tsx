import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { Book } from "@taiyomoe/ui/components/icons"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
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
      "@media (prefers-reduced-motion: reduce)": "0s",
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
  sx?: Sx
}

export function Cover({ src, alt = "", priority = "auto", sx }: CoverProps) {
  return (
    <span sx={[styles.frame, sx]}>
      {src === null ? <CoverPlaceholder /> : <CoverImage alt={alt} priority={priority} src={src} />}
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
}: {
  src: string
  alt: string
  priority: CoverProps["priority"]
}) {
  const { loaded, failed, ref, onLoad, onError } = useImageLoaded()

  if (failed) {
    return <CoverPlaceholder />
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
        onError={onError}
        onLoad={onLoad}
        src={src}
        sx={styles.image}
      />
    </>
  )
}

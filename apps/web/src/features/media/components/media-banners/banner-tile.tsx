import * as stylex from "@stylexjs/stylex"
import { ImageMissing } from "@taiyomoe/ui/components/icons"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, consts, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { MediaBanner } from "@/features/media/lib/media-images"
import { useImageLoaded } from "@/hooks/use-image-loaded"

const styles = stylex.create({
  tile: {
    margin: 0,
    padding: 0,
    borderRadius: radius.xl,
    borderWidth: 0,
    overflow: "hidden",
    aspectRatio: "16 / 5",
    backgroundColor: colors.well,
    boxShadow: {
      default: `0 0 0 1px ${colors.border}, 0 14px 32px -18px rgb(0 0 0 / 60%)`,
      ":focus-visible": `0 0 0 2px ${colors.ring}`,
    },
    cursor: "zoom-in",
    display: "block",
    isolation: "isolate",
    outlineStyle: "none",
    position: "relative",
    transform: { default: "translateY(0)", ":hover": "translateY(-2px)" },
    transitionDuration: motion.enterLarge,
    transitionProperty: "transform, box-shadow",
    transitionTimingFunction: motion.easeOut,
    width: "100%",
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
    opacity: { "[data-loaded]": 1, default: 0 },
    position: "absolute",
    transform: { default: "scale(1)", ":is(:hover > *)": "scale(1.04)" },
    transitionDuration: { default: "700ms, 200ms", [consts.reducedMotion]: "0s" },
    transitionProperty: "transform, opacity",
    transitionTimingFunction: motion.easeOut,
    height: "100%",
    width: "100%",
  },
  missing: {
    inset: 0,
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    justifyContent: "center",
    position: "absolute",
  },
})

export function BannerTile({
  banner,
  alt,
  onOpen,
}: {
  banner: MediaBanner
  alt: string
  onOpen: () => void
}) {
  const { loaded, failed, ref, onLoad, onError } = useImageLoaded()

  return (
    <button aria-haspopup="dialog" onClick={onOpen} sx={styles.tile} type="button">
      {loaded || failed ? null : <Skeleton sx={styles.fill} />}
      {failed ? (
        <span sx={styles.missing}>
          <ImageMissing size={24} />
        </span>
      ) : (
        <img
          ref={ref}
          alt={alt}
          data-loaded={loaded ? "" : undefined}
          decoding="async"
          draggable={false}
          loading="lazy"
          onError={onError}
          onLoad={onLoad}
          src={banner.url}
          sx={styles.image}
        />
      )}
    </button>
  )
}

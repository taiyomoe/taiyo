import * as stylex from "@stylexjs/stylex"
import { Crown } from "@taiyomoe/ui/components/icons"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { MediaCover } from "@/features/media/lib/media-images"
import { Cover } from "@/features/media/components/cover"
import { m } from "@/paraglide/messages"

const OVERLAY_INSET = "0.5rem"
const styles = stylex.create({
  tile: {
    margin: 0,
    padding: 0,
    borderWidth: 0,
    gap: "0.625rem",
    backgroundColor: "transparent",
    color: colors.foreground,
    cursor: "zoom-in",
    display: "flex",
    flexDirection: "column",
    outlineStyle: "none",
    position: "relative",
    textAlign: "start",
    minWidth: 0,
    width: "100%",
  },
  cover: {
    boxShadow: {
      default: `0 0 0 1px ${colors.border}, 0 10px 24px -14px rgb(0 0 0 / 50%)`,
      ":is(:focus-visible > *)": `0 0 0 2px ${colors.ring}`,
    },
    transform: { default: "translateY(0)", ":is(:hover > *)": "translateY(-2px)" },
    transitionDuration: motion.enterLarge,
    transitionProperty: "transform, box-shadow",
    transitionTimingFunction: motion.easeOut,
    width: "100%",
  },
  overlay: {
    borderRadius: `calc(${radius.lg} - ${OVERLAY_INSET})`,
    gap: "0.3125rem",
    paddingBlock: "0.1875rem",
    paddingInline: "0.375rem",
    alignItems: "center",
    backdropFilter: "blur(8px)",
    backgroundColor: "rgb(10 10 10 / 62%)",
    color: "rgb(255 255 255 / 92%)",
    display: "inline-flex",
    pointerEvents: "none",
    position: "absolute",
    zIndex: 1,
    top: OVERLAY_INSET,
  },
  main: {
    color: colors.warning,
    right: OVERLAY_INSET,
  },
  caption: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  label: {
    overflow: "hidden",
    fontSize: "0.875rem",
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  sublabel: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

export function CoverTile({
  cover,
  alt,
  label,
  sublabel,
  onOpen,
}: {
  cover: MediaCover
  alt: string
  label: string
  sublabel?: string | undefined
  onOpen: () => void
}) {
  return (
    <button aria-haspopup="dialog" onClick={onOpen} sx={styles.tile} type="button">
      <Cover alt={alt} src={cover.url} sx={styles.cover} />
      {cover.isMainCover ? (
        <span aria-label={m.media_covers_main()} sx={[styles.overlay, styles.main]}>
          <Crown size={12} />
        </span>
      ) : null}
      <span sx={styles.caption}>
        <span sx={styles.label}>{label}</span>
        {sublabel === undefined ? null : <span sx={styles.sublabel}>{sublabel}</span>}
      </span>
    </button>
  )
}

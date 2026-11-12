import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Ellipsis, ImageMissing } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Menu, MenuPopup, MenuTrigger } from "@taiyomoe/ui/components/ui/menu"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useImageLoaded } from "@/hooks/use-image-loaded"
import { m } from "@/paraglide/messages"

const PADDING = "0.5rem"
const styles = stylex.create({
  card: {
    padding: PADDING,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.625rem",
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  pending: {
    opacity: 0.5,
    pointerEvents: "none",
  },
  thumb: {
    margin: 0,
    padding: 0,
    borderRadius: `calc(${radius.xl} - ${PADDING} - 1px)`,
    borderWidth: 0,
    overflow: "hidden",
    backgroundColor: colors.well,
    cursor: "zoom-in",
    display: "block",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    position: "relative",
    width: "100%",
  },
  cover: {
    aspectRatio: "2 / 3",
  },
  banner: {
    aspectRatio: "16 / 5",
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
    transitionDuration: motion.enter,
    transitionProperty: "opacity",
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
  info: {
    gap: "0.25rem",
    paddingInline: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    paddingBottom: "0.125rem",
  },
  titleRow: {
    gap: "0.25rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  title: {
    overflow: "hidden",
    flexGrow: 1,
    fontSize: "0.875rem",
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  meta: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    minWidth: 0,
  },
  menuTrigger: {
    color: colors.mutedForeground,
    flexShrink: 0,
    marginInlineEnd: "-0.25rem",
  },
})

export function ManagedImageCard({
  kind,
  src,
  alt,
  title,
  meta,
  menu,
  pending,
  onOpen,
}: {
  kind: "cover" | "banner"
  src: string
  alt: string
  title: string
  meta: ReactNode
  menu: ReactNode
  pending: boolean
  onOpen: () => void
}) {
  const { loaded, failed, ref, onLoad, onError } = useImageLoaded()

  return (
    <div sx={[styles.card, pending && styles.pending]}>
      <button
        aria-haspopup="dialog"
        aria-label={m.media_lightbox_title()}
        onClick={onOpen}
        sx={[styles.thumb, kind === "cover" ? styles.cover : styles.banner]}
        type="button"
      >
        {loaded || failed ? null : <Skeleton sx={styles.fill} />}
        {failed ? (
          <span sx={styles.missing}>
            <ImageMissing size={22} />
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
            src={src}
            sx={styles.image}
          />
        )}
      </button>
      <div sx={styles.info}>
        <div sx={styles.titleRow}>
          <span sx={styles.title} title={title}>
            {title}
          </span>
          <Menu>
            <MenuTrigger
              aria-label={m.media_images_actions()}
              render={<Button size="icon-sm" sx={styles.menuTrigger} variant="ghost" />}
            >
              <Ellipsis />
            </MenuTrigger>
            <MenuPopup align="end">{menu}</MenuPopup>
          </Menu>
        </div>
        <div sx={styles.meta}>{meta}</div>
      </div>
    </div>
  )
}

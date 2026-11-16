import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import {
  ImageLightbox,
  type LightboxItem,
} from "@/features/media/components/image-lightbox/image-lightbox"

const styles = stylex.create({
  button: {
    padding: 0,
    borderRadius: "0.375rem",
    borderWidth: 0,
    overflow: "hidden",
    backgroundColor: colors.muted,
    cursor: "zoom-in",
    display: "block",
    flexShrink: 0,
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
  },
  cover: {
    aspectRatio: "2 / 3",
    width: "2.25rem",
  },
  banner: {
    aspectRatio: "16 / 5",
    width: "6.5rem",
  },
  image: {
    display: "block",
    objectFit: "cover",
    height: "100%",
    width: "100%",
  },
})

/** A cover or banner thumbnail that opens full screen, in the lightbox of the media page. */
export function ImageThumb({
  kind,
  label,
  item,
}: {
  kind: "cover" | "banner"
  label: string
  item: LightboxItem
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        aria-label={label}
        onClick={() => {
          setOpen(true)
        }}
        sx={[styles.button, styles[kind]]}
        type="button"
      >
        <img alt="" decoding="async" loading="lazy" src={item.url} sx={styles.image} />
      </button>
      <ImageLightbox
        index={open ? 0 : null}
        items={[item]}
        onClose={() => {
          setOpen(false)
        }}
        onIndexChange={() => {}}
      />
    </>
  )
}

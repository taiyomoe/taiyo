import * as stylex from "@stylexjs/stylex"
import { Library } from "@taiyomoe/ui/components/icons"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import { avatarStyles } from "@/features/activity-log/components/avatars/avatar-styles"

const styles = stylex.create({
  cover: {
    borderRadius: radius.sm,
    overflow: "hidden",
    aspectRatio: "2 / 3",
    backgroundColor: colors.well,
    boxShadow: `0 0 0 1px ${colors.border}`,
    flexShrink: 0,
    position: "relative",
  },
  coverSize: (height: string) => ({
    height,
  }),
  coverIcon: {
    inset: 0,
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    justifyContent: "center",
    position: "absolute",
  },
})

export function CoverThumb({ src, height }: { src: string | null; height: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <span aria-hidden sx={[styles.cover, styles.coverSize(height)]}>
      {src === null || failed ? (
        <span sx={styles.coverIcon}>
          <Library size={14} />
        </span>
      ) : (
        <img
          alt=""
          decoding="async"
          loading="lazy"
          onError={() => {
            setFailed(true)
          }}
          src={src}
          sx={avatarStyles.image}
        />
      )}
    </span>
  )
}

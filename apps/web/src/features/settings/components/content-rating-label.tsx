import * as stylex from "@stylexjs/stylex"
import { colors, consts } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ContentRating } from "@/lib/settings"
import { mascotStyles } from "@/features/settings/components/mascot-styles"
import { NsflMascot } from "@/features/settings/components/nsfl-mascot"
import { NsfwMascot } from "@/features/settings/components/nsfw-mascot"
import { SuggestiveMascot } from "@/features/settings/components/suggestive-mascot"

const sweep = stylex.keyframes({
  "0%": { backgroundPosition: "150% 0" },
  "45%": { backgroundPosition: "-50% 0" },
  "100%": { backgroundPosition: "-50% 0" },
})
const styles = stylex.create({
  label: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  shimmer: {
    WebkitBackgroundClip: "text",
    backgroundPosition: "150% 0",
    animationDuration: { default: "3.2s", [consts.reducedMotion]: "0s" },
    animationIterationCount: "infinite",
    animationName: sweep,
    animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundClip: "text",
    backgroundColor: colors.contentNsfw,
    backgroundImage: `linear-gradient(105deg, transparent 30%, color-mix(in srgb, ${colors.contentNsfwShine} 75%, transparent) 43%, ${colors.contentNsfwShine} 50%, color-mix(in srgb, ${colors.contentNsfwShine} 75%, transparent) 57%, transparent 70%)`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "200% 100%",
    color: "transparent",
  },
})

type ContentRatingLabelProps = {
  rating: ContentRating
  label: string
}

export function ContentRatingLabel({ rating, label }: ContentRatingLabelProps) {
  if (rating === "NSFW") {
    return (
      <span sx={styles.label}>
        <NsfwMascot />
        <span sx={styles.shimmer}>{label}</span>
      </span>
    )
  }

  return (
    <span sx={styles.label}>
      {rating === "SUGGESTIVE" ? <SuggestiveMascot /> : null}
      {rating === "NSFL" ? <NsflMascot /> : null}
      {rating === "NORMAL" ? <span sx={mascotStyles.mascot} /> : null}
      {label}
    </span>
  )
}

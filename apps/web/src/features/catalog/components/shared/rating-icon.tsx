import type { ContentRating } from "@taiyomoe/db/constants"
import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import { Flame, Kissing, ShieldCheck, Skull } from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

const RATING_ICONS: Record<ContentRating, (props: IconProps) => ReactElement> = {
  NORMAL: ShieldCheck,
  SUGGESTIVE: Kissing,
  NSFW: Flame,
  NSFL: Skull,
}
const styles = stylex.create({
  icon: {
    flexShrink: 0,
    height: "1rem",
    width: "1rem",
  },
  NORMAL: { color: colors.success },
  SUGGESTIVE: { color: colors.warning },
  NSFW: { color: colors.destructive },
  NSFL: { color: colors.destructive },
})

export function RatingIcon({ rating }: { rating: ContentRating }) {
  const Icon = RATING_ICONS[rating]

  return <Icon aria-hidden {...stylex.props(styles.icon, styles[rating])} />
}

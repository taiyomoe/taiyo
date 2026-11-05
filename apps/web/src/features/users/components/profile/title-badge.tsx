import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { isUserTitle, USER_TITLES } from "@taiyomoe/db/cosmetics"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { RARITY_STYLES } from "@/features/users/components/profile/rarity-styles"
import { USER_TITLE_LABELS } from "@/features/users/lib/cosmetic-labels"

const styles = stylex.create({
  badge: {
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    paddingBlock: "0.1875rem",
    paddingInline: "0.625rem",
    alignItems: "center",
    display: "inline-flex",
    fontSize: "0.75rem",
    fontWeight: 650,
    letterSpacing: "0.02em",
    lineHeight: 1.3,
    whiteSpace: "nowrap",
  },
  small: {
    paddingBlock: "0.0625rem",
    paddingInline: "0.4375rem",
    fontSize: "0.6875rem",
  },
})

export function TitleBadge({
  title,
  size = "default",
  sx,
}: {
  title: string | null
  size?: "default" | "sm"
  sx?: Sx
}) {
  if (!isUserTitle(title)) {
    return null
  }

  return (
    <span
      sx={[
        styles.badge,
        size === "sm" && styles.small,
        RARITY_STYLES[USER_TITLES[title].rarity],
        sx,
      ]}
    >
      {USER_TITLE_LABELS[title]()}
    </span>
  )
}

import * as stylex from "@stylexjs/stylex"
import { Robot, User } from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { FacetValue } from "@/features/activity-log/components/breakdown/types"
import { PersonAvatar } from "@/features/activity-log/components/entity-avatar"

const styles = stylex.create({
  glyph: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
})

export function ActorGlyph({ entry }: { entry: FacetValue }) {
  if (entry.type !== "user" || entry.value === "anonymous") {
    const Glyph = entry.type === "user" ? User : Robot

    return <Glyph {...stylex.props(styles.glyph)} size={16} />
  }

  return (
    <PersonAvatar
      border={entry.avatarBorder}
      image={entry.image ?? null}
      name={entry.displayName ?? entry.value}
      seed={entry.value}
      size="1.25rem"
    />
  )
}

import * as stylex from "@stylexjs/stylex"
import { Close } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Toggle } from "@taiyomoe/ui/components/ui/toggle"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { MediaEditDraft } from "@/features/media-suggestions/lib/media-edit-model"
import { getTagName } from "@/features/media-suggestions/lib/media-edit-labels"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  chip: {
    borderRadius: radius.full,
    gap: "0.125rem",
    paddingBlock: "0.125rem",
    alignItems: "center",
    backgroundColor: colors.muted,
    display: "flex",
    fontSize: "0.875rem",
    paddingInlineEnd: "0.125rem",
    paddingInlineStart: "0.75rem",
  },
  chipLabel: {
    paddingInlineEnd: "0.25rem",
  },
  chipSpoiler: {
    color: colors.warning,
  },
  spoilerToggle: {
    color: {
      "[data-pressed]": colors.warning,
      default: colors.mutedForeground,
    },
    fontSize: "0.75rem",
  },
})

export function TagChip({
  tag,
  onSpoilerChange,
  onRemove,
}: {
  tag: MediaEditDraft["tags"][number]
  onSpoilerChange: (isSpoiler: boolean) => void
  onRemove: () => void
}) {
  return (
    <li sx={styles.chip}>
      <span sx={[styles.chipLabel, tag.isSpoiler && styles.chipSpoiler]}>
        {getTagName(tag.key)}
      </span>
      <Toggle
        aria-label={m.media_edit_tag_spoiler()}
        onPressedChange={onSpoilerChange}
        pressed={tag.isSpoiler}
        size="sm"
        sx={styles.spoilerToggle}
      >
        {m.media_edit_tag_spoiler()}
      </Toggle>
      <Button aria-label={m.media_edit_remove()} onClick={onRemove} size="icon-xs" variant="ghost">
        <Close />
      </Button>
    </li>
  )
}

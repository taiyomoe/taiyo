import type { MediaEditField } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { MediaEditDraft } from "@/features/media-suggestions/lib/media-edit-model"
import { FIELD_PREVIEWS } from "@/features/media-suggestions/components/suggestion-review/media-edit-preview"

const styles = stylex.create({
  column: {
    gap: "0.625rem",
    paddingBlock: "1.25rem",
    paddingInline: "1.5rem",
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  suggested: {
    backgroundColor: `color-mix(in srgb, ${colors.success} 6%, ${colors.card})`,
  },
  columnLabel: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
})

export function FieldReviewColumn({
  label,
  field,
  draft,
  highlight = false,
}: {
  label: string
  field: MediaEditField
  draft: MediaEditDraft
  highlight?: boolean
}) {
  return (
    <div sx={[styles.column, highlight && styles.suggested]}>
      <span sx={styles.columnLabel}>{label}</span>
      {FIELD_PREVIEWS[field](draft)}
    </div>
  )
}

import type { BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { MediaSuggestion } from "@/features/media-suggestions/api/media-suggestions"
import { Pill } from "@/components/badges/pill"
import { FIELD_LABELS } from "@/features/media-suggestions/lib/media-edit-model"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  conflicts: {
    color: colors.warningForeground,
    fontSize: "0.8125rem",
    whiteSpace: "nowrap",
  },
})

/** The fields a suggestion changes, colored by what became of each one. */
export function SuggestionFields({ suggestion }: { suggestion: MediaSuggestion }) {
  return (
    <>
      {suggestion.fields.map((field) => {
        let variant: BadgeVariant = "outline"
        let title: string | undefined

        if (suggestion.conflicts.includes(field)) {
          variant = "warning"
          title = m.suggestion_changed_since()
        } else if (suggestion.status === "ACCEPTED") {
          const accepted = suggestion.acceptedFields.includes(field)

          variant = accepted ? "success" : "secondary"
          title = accepted ? m.suggestion_field_accepted() : m.suggestion_field_not_accepted()
        }

        return (
          <Pill key={field} title={title} variant={variant}>
            {FIELD_LABELS[field]()}
          </Pill>
        )
      })}
      {suggestion.conflicts.length === 0 ? null : (
        <span sx={styles.conflicts}>
          {m.suggestion_conflicts({ count: suggestion.conflicts.length })}
        </span>
      )}
    </>
  )
}

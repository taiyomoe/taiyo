import * as stylex from "@stylexjs/stylex"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import type { KqlSuggestion } from "@/features/activity-log/lib/kql-suggestions"
import { KqlHints } from "@/features/activity-log/components/kql/kql-hints"
import { KqlSuggestionOption } from "@/features/activity-log/components/kql/kql-suggestion-option"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  popup: {
    padding: "0.375rem",
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "border-box",
    backgroundColor: colors.popover,
    boxShadow: shadows.overlay,
    color: colors.popoverForeground,
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    zIndex: 40,
    left: 0,
    right: 0,
    top: "calc(100% + 0.375rem)",
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    maxHeight: "min(22rem, 50svh)",
    overflowY: "auto",
  },
})

export function KqlSuggestionList({
  suggestions,
  active,
  listId,
  onActiveChange,
  onApply,
}: {
  suggestions: readonly KqlSuggestion[]
  active: number
  listId: string
  onActiveChange: (index: number) => void
  onApply: (suggestion: KqlSuggestion) => void
}) {
  return (
    <div sx={styles.popup}>
      <ul aria-label={m.activity_suggestions_label()} id={listId} role="listbox" sx={styles.list}>
        {suggestions.map((suggestion, index) => (
          <KqlSuggestionOption
            active={index === active}
            id={`${listId}-${index}`}
            key={suggestion.key}
            onActivate={() => {
              onActiveChange(index)
            }}
            onApply={() => {
              onApply(suggestion)
            }}
            suggestion={suggestion}
          />
        ))}
      </ul>
      <KqlHints />
    </div>
  )
}

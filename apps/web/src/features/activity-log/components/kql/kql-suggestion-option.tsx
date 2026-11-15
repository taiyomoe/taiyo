import * as stylex from "@stylexjs/stylex"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { KqlSuggestion } from "@/features/activity-log/lib/kql-suggestions"
import { UserName } from "@/components/user-name/user-name"
import { PersonAvatar } from "@/features/activity-log/components/entity-avatar"
import { FieldTypeChip } from "@/features/activity-log/components/fields"

const styles = stylex.create({
  option: {
    borderRadius: `calc(${radius.xl} - 0.375rem)`,
    gap: "0.75rem",
    paddingInline: "0.75rem",
    alignItems: "center",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "1.25rem minmax(0, auto) minmax(0, 1fr)",
    minHeight: "2.5rem",
  },
  optionActive: {
    backgroundColor: colors.accent,
  },
  optionLabel: {
    overflow: "hidden",
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  optionDescription: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    textAlign: "end",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

export function KqlSuggestionOption({
  suggestion,
  id,
  active,
  onActivate,
  onApply,
}: {
  suggestion: KqlSuggestion
  id: string
  active: boolean
  onActivate: () => void
  onApply: () => void
}) {
  return (
    <li
      aria-selected={active}
      id={id}
      onClick={onApply}
      onMouseDown={(event) => {
        event.preventDefault()
      }}
      onMouseMove={() => {
        if (!active) {
          onActivate()
        }
      }}
      role="option"
      sx={[styles.option, active && styles.optionActive]}
    >
      {suggestion.image !== null && suggestion.image !== "" ? (
        <PersonAvatar
          border={suggestion.avatarBorder}
          image={suggestion.image}
          name={suggestion.label}
          seed={suggestion.key}
          size="1.25rem"
        />
      ) : (
        <FieldTypeChip kind={suggestion.kind} type={suggestion.field?.type ?? null} />
      )}
      <span sx={styles.optionLabel}>{suggestion.label}</span>
      <span sx={styles.optionDescription}>
        {suggestion.description === null ? null : (
          <UserName effect={suggestion.nameEffect} name={suggestion.description} />
        )}
      </span>
    </li>
  )
}

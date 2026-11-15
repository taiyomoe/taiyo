import type { KqlSyntaxError } from "@taiyomoe/audit/query"
import * as stylex from "@stylexjs/stylex"
import { AlertCircle, Search } from "@taiyomoe/ui/components/icons"
import { colors, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { KqlHighlight } from "@/features/activity-log/components/kql/kql-highlight"
import { KqlSuggestionList } from "@/features/activity-log/components/kql/kql-suggestion-list"
import { KqlSyntaxHelp } from "@/features/activity-log/components/kql/kql-syntax-help"
import { KqlTextarea } from "@/features/activity-log/components/kql/kql-textarea"
import { useKqlInput } from "@/features/activity-log/hooks/use-kql-input"

const styles = stylex.create({
  root: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    minWidth: 0,
  },
  field: {
    borderColor: {
      default: colors.input,
      ":focus-within": colors.ring,
    },
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.625rem",
    alignItems: "flex-start",
    backgroundClip: "padding-box",
    backgroundColor: colors.field,
    boxShadow: {
      default: shadows.chip,
      ":focus-within": "none",
    },
    display: "flex",
    outlineColor: `color-mix(in srgb, ${colors.ring} 24%, transparent)`,
    outlineStyle: {
      default: "none",
      ":focus-within": "solid",
    },
    outlineWidth: 3,
    paddingInlineEnd: "0.375rem",
    paddingInlineStart: "0.875rem",
    position: "relative",
    transitionDuration: motion.enter,
    transitionProperty: "box-shadow, border-color",
  },
  fieldInvalid: {
    borderColor: {
      default: `color-mix(in srgb, ${colors.destructive} 36%, transparent)`,
      ":focus-within": `color-mix(in srgb, ${colors.destructive} 64%, transparent)`,
    },
    outlineColor: `color-mix(in srgb, ${colors.destructive} 16%, transparent)`,
  },
  icon: {
    color: colors.mutedForeground,
    flexShrink: 0,
    marginTop: "0.6875rem",
  },
  editor: {
    flex: "1",
    position: "relative",
    minWidth: 0,
  },
  error: {
    margin: 0,
    gap: "0.5rem",
    paddingInline: "0.25rem",
    alignItems: "center",
    color: colors.destructive,
    display: "flex",
    fontSize: "0.8125rem",
  },
})

export function KqlInput({
  value,
  error,
  onChange,
  onSubmit,
}: {
  value: string
  error: KqlSyntaxError | null
  onChange: (value: string) => void
  onSubmit: (value: string) => void
}) {
  const {
    textareaRef,
    listId,
    errorId,
    active,
    setActive,
    suggestions,
    showSuggestions,
    apply,
    handleBlur,
    handleChange,
    handleFocus,
    handleKeyDown,
    handleSelect,
  } = useKqlInput({ value, onChange, onSubmit })

  return (
    <div sx={styles.root}>
      <div sx={[styles.field, error !== null && styles.fieldInvalid]}>
        <Search {...stylex.props(styles.icon)} size={18} />
        <div sx={styles.editor}>
          <KqlHighlight error={error} value={value} />
          <KqlTextarea
            active={active}
            errorId={errorId}
            expanded={showSuggestions}
            invalid={error !== null}
            listId={listId}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            onSelect={handleSelect}
            textareaRef={textareaRef}
            value={value}
          />
        </div>
        <KqlSyntaxHelp onChange={onChange} onSubmit={onSubmit} />
      </div>
      {showSuggestions ? (
        <KqlSuggestionList
          active={active}
          listId={listId}
          onActiveChange={setActive}
          onApply={apply}
          suggestions={suggestions}
        />
      ) : null}
      {error === null ? null : (
        <p id={errorId} role="alert" sx={styles.error}>
          <AlertCircle size={16} />
          {error.message}
        </p>
      )}
    </div>
  )
}

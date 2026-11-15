import type { ChangeEventHandler, KeyboardEventHandler, ReactEventHandler, RefObject } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { kqlStyles } from "@/features/activity-log/components/kql/kql-styles"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  textarea: {
    inset: 0,
    overflow: "hidden",
    backgroundColor: "transparent",
    caretColor: colors.foreground,
    color: "transparent",
    outlineStyle: "none",
    position: "absolute",
    resize: "none",
    height: "100%",
    width: "100%",
  },
})

export function KqlTextarea({
  value,
  invalid,
  active,
  expanded,
  listId,
  errorId,
  textareaRef,
  onBlur,
  onChange,
  onFocus,
  onKeyDown,
  onSelect,
}: {
  value: string
  invalid: boolean
  active: number
  expanded: boolean
  listId: string
  errorId: string
  textareaRef: RefObject<HTMLTextAreaElement | null>
  onBlur: () => void
  onChange: ChangeEventHandler<HTMLTextAreaElement>
  onFocus: () => void
  onKeyDown: KeyboardEventHandler<HTMLTextAreaElement>
  onSelect: ReactEventHandler<HTMLTextAreaElement>
}) {
  return (
    <textarea
      aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
      aria-autocomplete="list"
      aria-controls={listId}
      aria-describedby={invalid ? errorId : undefined}
      aria-expanded={expanded}
      aria-invalid={invalid}
      aria-label={m.activity_query_label()}
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      onBlur={onBlur}
      onChange={onChange}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onSelect={onSelect}
      ref={textareaRef}
      role="combobox"
      rows={1}
      spellCheck={false}
      sx={[kqlStyles.text, styles.textarea]}
      value={value}
    />
  )
}

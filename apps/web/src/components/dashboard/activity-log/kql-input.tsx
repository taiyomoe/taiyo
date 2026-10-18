import type { AuditLogField, KqlSyntaxError } from "@taiyomoe/audit/query"
import * as stylex from "@stylexjs/stylex"
import { tokenizeKql } from "@taiyomoe/audit/query"
import { AlertCircle, Search } from "@taiyomoe/ui/components/icons"
import { Kbd } from "@taiyomoe/ui/components/ui/kbd"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { colors, font, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { PersonAvatar } from "@/components/dashboard/activity-log/entity-avatar"
import {
  describeField,
  describeOperator,
  FieldTypeChip,
} from "@/components/dashboard/activity-log/fields"
import {
  getKqlContext,
  getKqlRoles,
  getOperatorSuggestions,
  getTermSuggestions,
  getValueSuggestions,
  type KqlRole,
  type KqlSuggestion,
} from "@/components/dashboard/activity-log/kql-suggestions"
import { auditLogSuggestionsQueryOptions } from "@/lib/queries/audit-logs"
import { m } from "@/paraglide/messages"

const EXAMPLES = [
  "actor: admin",
  "category: media and not outcome: success",
  "severity >= high",
  "action: media.*",
  "outcome: (failure or denied)",
  "changed: role",
  "target.mediaId: *",
  '"Moonlit Garden"',
]
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
  text: {
    margin: 0,
    borderWidth: 0,
    paddingBlock: "0.5625rem",
    paddingInline: 0,
    fontFamily: font.mono,
    fontSize: "0.875rem",
    fontVariantLigatures: "none",
    letterSpacing: "normal",
    lineHeight: "1.5rem",
    overflowWrap: "anywhere",
    tabSize: 2,
    whiteSpace: "pre-wrap",
  },
  highlight: {
    color: colors.foreground,
    pointerEvents: "none",
    minHeight: "2.625rem",
  },
  placeholder: {
    color: `color-mix(in srgb, ${colors.mutedForeground} 72%, transparent)`,
  },
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
  syntax: {
    borderRadius: radius.md,
    paddingBlock: "0.25rem",
    paddingInline: "0.5rem",
    backgroundColor: {
      default: colors.chip,
      ":hover": colors.chipHover,
    },
    boxShadow: shadows.chip,
    color: colors.mutedForeground,
    cursor: "pointer",
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    marginTop: "0.5rem",
  },
  field_: { color: colors.info },
  operator: { color: colors.mutedForeground },
  value: { color: colors.foreground },
  string: { color: colors.success },
  keyword: { color: colors.chart3, fontWeight: 600 },
  paren: { color: colors.mutedForeground },
  wildcard: { color: colors.warning },
  free: { color: colors.foreground },
  invalid: {
    textDecorationColor: colors.destructive,
    textDecorationLine: "underline",
    textDecorationStyle: "wavy",
    textUnderlineOffset: "0.25rem",
  },
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
  footer: {
    gap: "1rem",
    paddingInline: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.75rem",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
    marginTop: "0.375rem",
    paddingBottom: "0.125rem",
    paddingTop: "0.5rem",
  },
  hint: {
    gap: "0.375rem",
    alignItems: "center",
    display: "inline-flex",
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
  help: {
    padding: "0.25rem",
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
    width: "min(26rem, calc(100vw - 2rem))",
  },
  helpTitle: {
    margin: 0,
    fontSize: "0.9375rem",
    fontWeight: 600,
  },
  helpText: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    lineHeight: 1.5,
  },
  examples: {
    margin: 0,
    padding: 0,
    gap: "0.125rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  example: {
    borderRadius: radius.md,
    borderWidth: 0,
    paddingBlock: "0.5rem",
    paddingInline: "0.625rem",
    backgroundColor: {
      default: "transparent",
      ":hover": colors.accent,
    },
    color: colors.foreground,
    cursor: "pointer",
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    textAlign: "start",
    width: "100%",
  },
})
const ROLE_STYLES: Record<KqlRole, stylex.StyleXStyles | null> = {
  field: styles.field_,
  operator: styles.operator,
  value: styles.value,
  string: styles.string,
  keyword: styles.keyword,
  paren: styles.paren,
  wildcard: styles.wildcard,
  text: styles.free,
  space: null,
}
const useDebounced = <T,>(value: T, delay: number) => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounced(value)
    }, delay)

    return () => {
      clearTimeout(timeout)
    }
  }, [value, delay])

  return debounced
}

type KqlInputProps = {
  value: string
  error: KqlSyntaxError | null
  onChange: (value: string) => void
  onSubmit: (value: string) => void
}

export function KqlInput({ value, error, onChange, onSubmit }: KqlInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const listId = useId()
  const errorId = useId()
  const [cursor, setCursor] = useState(value.length)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [helpOpen, setHelpOpen] = useState(false)
  const context = useMemo(() => getKqlContext(value, cursor), [value, cursor])
  const remoteField: AuditLogField | null =
    context.kind === "value" && context.field.values === undefined && context.field.suggest === true
      ? context.field
      : null
  const remotePrefix = useDebounced(context.kind === "value" ? context.prefix : "", 150)
  const remote = useQuery({
    ...auditLogSuggestionsQueryOptions(remoteField?.name ?? "", remotePrefix),
    enabled: open && remoteField !== null,
  })
  const suggestions = useMemo((): KqlSuggestion[] => {
    switch (context.kind) {
      case "term": {
        return getTermSuggestions(context, describeField)
      }

      case "operator": {
        return getOperatorSuggestions(context, describeOperator)
      }

      case "value": {
        const values =
          context.field.values?.map((option) => ({ value: option, label: null, image: null })) ??
          (remoteField === null ? [] : (remote.data ?? []))

        return getValueSuggestions(context, values, m.activity_any_value())
      }

      case "none":

      default: {
        return []
      }
    }
  }, [context, remote.data, remoteField])
  const tokens = useMemo(() => tokenizeKql(value), [value])
  const roles = useMemo(() => getKqlRoles(tokens), [tokens])
  const showSuggestions = open && suggestions.length > 0

  useEffect(() => {
    if (active >= 0) {
      document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" })
    }
  }, [active, listId])

  const moveCursor = (position: number) => {
    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(position, position)
    })
  }
  const apply = (suggestion: KqlSuggestion) => {
    const next = `${value.slice(0, suggestion.start)}${suggestion.insert}${value.slice(suggestion.end)}`
    const position = suggestion.start + suggestion.insert.length

    onChange(next)
    setCursor(position)
    setActive(-1)
    setOpen(true)
    moveCursor(position)
  }

  return (
    <div sx={styles.root}>
      <div sx={[styles.field, error !== null && styles.fieldInvalid]}>
        <Search {...stylex.props(styles.icon)} size={18} />
        <div sx={styles.editor}>
          <div aria-hidden sx={[styles.text, styles.highlight]}>
            {value === "" ? (
              <span sx={styles.placeholder}>{m.activity_query_placeholder()}</span>
            ) : null}
            {tokens.map((token, index) => {
              const role = roles[index] ?? "space"
              const invalid = error !== null && token.start < error.end && token.end > error.start
              const roleStyle = ROLE_STYLES[role]

              return (
                <span
                  key={`${token.start}-${token.text}`}
                  sx={[roleStyle, invalid && styles.invalid]}
                >
                  {token.text}
                </span>
              )
            })}
            {"​"}
          </div>
          <textarea
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-describedby={error === null ? undefined : errorId}
            aria-expanded={showSuggestions}
            aria-invalid={error !== null}
            aria-label={m.activity_query_label()}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            onBlur={() => {
              setOpen(false)
              setActive(-1)
            }}
            onChange={(event) => {
              onChange(event.currentTarget.value.replaceAll("\n", " "))
              setCursor(event.currentTarget.selectionStart)
              setOpen(true)
              setActive(-1)
            }}
            onFocus={() => {
              setOpen(true)
            }}
            onKeyDown={(event) => {
              const count = suggestions.length

              if (event.key === "ArrowDown" && showSuggestions) {
                event.preventDefault()
                setActive((current) => (current + 1) % count)
              } else if (event.key === "ArrowUp" && showSuggestions) {
                event.preventDefault()
                setActive((current) => (current <= 0 ? count - 1 : current - 1))
              } else if (event.key === "Enter") {
                event.preventDefault()

                const suggestion = suggestions[active]

                if (showSuggestions && suggestion !== undefined) {
                  apply(suggestion)
                } else {
                  setOpen(false)
                  onSubmit(value)
                }
              } else if (event.key === "Tab" && showSuggestions && !event.shiftKey) {
                const suggestion = suggestions[Math.max(active, 0)]

                if (suggestion !== undefined) {
                  event.preventDefault()
                  apply(suggestion)
                }
              } else if (event.key === "Escape" && showSuggestions) {
                event.preventDefault()
                setOpen(false)
              }
            }}
            onSelect={(event) => {
              setCursor(event.currentTarget.selectionStart)
            }}
            ref={textareaRef}
            role="combobox"
            rows={1}
            spellCheck={false}
            sx={[styles.text, styles.textarea]}
            value={value}
          />
        </div>
        <Popover onOpenChange={setHelpOpen} open={helpOpen}>
          <PopoverTrigger aria-label={m.activity_syntax_label()} sx={styles.syntax}>
            KQL
          </PopoverTrigger>
          <PopoverPopup align="end">
            <div sx={styles.help}>
              <p sx={styles.helpTitle}>{m.activity_syntax_title()}</p>
              <p sx={styles.helpText}>{m.activity_syntax_body()}</p>
              <ul sx={styles.examples}>
                {EXAMPLES.map((example) => (
                  <li key={example}>
                    <button
                      onClick={() => {
                        setHelpOpen(false)
                        onChange(example)
                        onSubmit(example)
                      }}
                      sx={styles.example}
                      type="button"
                    >
                      {example}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </PopoverPopup>
        </Popover>
      </div>
      {showSuggestions ? (
        <div sx={styles.popup}>
          <ul
            aria-label={m.activity_suggestions_label()}
            id={listId}
            role="listbox"
            sx={styles.list}
          >
            {suggestions.map((suggestion, index) => (
              <li
                aria-selected={index === active}
                id={`${listId}-${index}`}
                key={suggestion.key}
                onClick={() => {
                  apply(suggestion)
                }}
                onMouseDown={(event) => {
                  event.preventDefault()
                }}
                onMouseMove={() => {
                  if (active !== index) {
                    setActive(index)
                  }
                }}
                role="option"
                sx={[styles.option, index === active && styles.optionActive]}
              >
                {suggestion.image !== null && suggestion.image !== "" ? (
                  <PersonAvatar
                    image={suggestion.image}
                    name={suggestion.label}
                    seed={suggestion.key}
                    size="1.25rem"
                  />
                ) : (
                  <FieldTypeChip kind={suggestion.kind} type={suggestion.field?.type ?? null} />
                )}
                <span sx={styles.optionLabel}>{suggestion.label}</span>
                <span sx={styles.optionDescription}>{suggestion.description}</span>
              </li>
            ))}
          </ul>
          <div sx={styles.footer}>
            <span sx={styles.hint}>
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              {m.activity_hint_navigate()}
            </span>
            <span sx={styles.hint}>
              <Kbd>Tab</Kbd>
              {m.activity_hint_complete()}
            </span>
            <span sx={styles.hint}>
              <Kbd>Enter</Kbd>
              {m.activity_hint_search()}
            </span>
          </div>
        </div>
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

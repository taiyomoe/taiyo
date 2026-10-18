import * as stylex from "@stylexjs/stylex"
import { AUDIT_LOG_FIELDS, getAuditLogField } from "@taiyomoe/audit/query"
import { Close, Ellipsis, Plus } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Input } from "@taiyomoe/ui/components/ui/input"
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@taiyomoe/ui/components/ui/menu"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { colors, font, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { PersonAvatar } from "@/components/dashboard/activity-log/entity-avatar"
import { describeField, FieldTypeChip } from "@/components/dashboard/activity-log/fields"
import {
  enableFilter,
  FILTER_OPERATORS,
  type FilterOperator,
  getFilterKey,
  isMultiValueOperator,
  isValuelessOperator,
  type LogFilter,
  NEGATED_OPERATORS,
  negateOperator,
} from "@/lib/activity-log"
import { auditLogSuggestionsQueryOptions } from "@/lib/queries/audit-logs"
import { m } from "@/paraglide/messages"

const OPERATOR_LABELS: Record<FilterOperator, () => string> = {
  is: m.activity_filter_is,
  is_not: m.activity_filter_is_not,
  is_one_of: m.activity_filter_is_one_of,
  is_not_one_of: m.activity_filter_is_not_one_of,
  exists: m.activity_filter_exists,
  not_exists: m.activity_filter_not_exists,
}
const styles = stylex.create({
  bar: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  pill: {
    borderColor: colors.border,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.375rem",
    paddingBlock: "0.3125rem",
    alignItems: "center",
    backgroundColor: {
      "[data-popup-open]": colors.chipHover,
      default: colors.chip,
      ":hover": colors.chipHover,
    },
    boxShadow: shadows.chip,
    color: colors.foreground,
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "0.8125rem",
    paddingInlineEnd: "0.75rem",
    paddingInlineStart: "0.75rem",
    transitionDuration: motion.enter,
    transitionProperty: "background-color, opacity",
    maxWidth: "min(28rem, 100%)",
  },
  pillNegated: {
    borderColor: `color-mix(in srgb, ${colors.destructive} 32%, transparent)`,
    backgroundColor: {
      "[data-popup-open]": `color-mix(in srgb, ${colors.destructive} 14%, ${colors.chip})`,
      default: `color-mix(in srgb, ${colors.destructive} 8%, ${colors.chip})`,
      ":hover": `color-mix(in srgb, ${colors.destructive} 14%, ${colors.chip})`,
    },
  },
  pillDisabled: {
    opacity: 0.6,
    textDecorationLine: "line-through",
  },
  not: {
    color: colors.destructive,
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
  },
  pillField: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
  },
  pillValue: {
    overflow: "hidden",
    fontFamily: font.mono,
    fontWeight: 500,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  add: {
    color: colors.mutedForeground,
  },
  actions: {
    padding: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: "14rem",
  },
  action: {
    borderRadius: `calc(${radius.xl} - 0.25rem)`,
    borderWidth: 0,
    gap: "0.625rem",
    paddingInline: "0.75rem",
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": colors.accent,
    },
    color: colors.foreground,
    cursor: "pointer",
    display: "flex",
    fontSize: "0.875rem",
    textAlign: "start",
    minHeight: "2.5rem",
  },
  actionDanger: {
    color: colors.destructive,
  },
  editor: {
    padding: "0.375rem",
    gap: "0.875rem",
    display: "flex",
    flexDirection: "column",
    width: "min(26rem, calc(100vw - 2rem))",
  },
  title: {
    margin: 0,
    fontSize: "0.9375rem",
    fontWeight: 600,
  },
  row: {
    gap: "0.5rem",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
  },
  label: {
    gap: "0.375rem",
    color: colors.mutedForeground,
    display: "flex",
    flexDirection: "column",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  option: {
    gap: "0.625rem",
    alignItems: "center",
    display: "inline-flex",
    fontFamily: font.mono,
    fontSize: "0.8125rem",
  },
  hint: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 400,
  },
  chips: {
    gap: "0.375rem",
    display: "flex",
    flexWrap: "wrap",
    maxHeight: "6.5rem",
    overflowY: "auto",
  },
  chip: {
    borderColor: colors.border,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.375rem",
    paddingBlock: "0.25rem",
    paddingInline: "0.625rem",
    alignItems: "center",
    backgroundColor: {
      default: colors.chip,
      ":hover": colors.chipHover,
    },
    color: colors.foreground,
    cursor: "pointer",
    display: "inline-flex",
    fontFamily: font.mono,
    fontSize: "0.75rem",
    maxWidth: "100%",
    minWidth: 0,
  },
  chipLabel: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chipSelected: {
    borderColor: `color-mix(in srgb, ${colors.primary} 48%, transparent)`,
    color: colors.primary,
  },
  footer: {
    gap: "0.5rem",
    display: "flex",
    justifyContent: "flex-end",
  },
})
const describeValues = ({ operator, values }: LogFilter) => {
  if (isValuelessOperator(operator)) {
    return operator === "exists" ? m.activity_filter_exists() : m.activity_filter_not_exists()
  }

  return isMultiValueOperator(operator)
    ? m.activity_filter_one_of({ values: values.join(", ") })
    : (values[0] ?? "")
}

type FilterBarProps = {
  filters: readonly LogFilter[]
  onChange: (filters: LogFilter[]) => void
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const [adding, setAdding] = useState(false)
  const update = (index: number, next: LogFilter | null) => {
    onChange(
      filters.flatMap((filter, position) => {
        if (position !== index) {
          return [filter]
        }

        return next === null ? [] : [next]
      }),
    )
  }

  return (
    <div aria-label={m.activity_filters_label()} role="group" sx={styles.bar}>
      {filters.length > 0 ? (
        <Menu>
          <MenuTrigger
            render={
              <Button aria-label={m.activity_filters_actions()} size="icon-sm" variant="ghost" />
            }
          >
            <Ellipsis />
          </MenuTrigger>
          <MenuPopup align="start">
            <MenuItem
              onClick={() => {
                onChange(filters.map(enableFilter))
              }}
            >
              {m.activity_filters_enable_all()}
            </MenuItem>
            <MenuItem
              onClick={() => {
                onChange(filters.map((filter) => ({ ...filter, disabled: true })))
              }}
            >
              {m.activity_filters_disable_all()}
            </MenuItem>
            <MenuItem
              onClick={() => {
                onChange(
                  filters.map((filter) => ({
                    ...filter,
                    operator: negateOperator(filter.operator),
                  })),
                )
              }}
            >
              {m.activity_filters_invert_all()}
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              onClick={() => {
                onChange([])
              }}
              variant="destructive"
            >
              {m.activity_filters_remove_all()}
            </MenuItem>
          </MenuPopup>
        </Menu>
      ) : null}
      {filters.map((filter, index) => (
        <FilterPill
          filter={filter}
          key={getFilterKey(filter)}
          onChange={(next) => {
            update(index, next)
          }}
        />
      ))}
      <Popover onOpenChange={setAdding} open={adding}>
        <PopoverTrigger render={<Button size="sm" sx={styles.add} variant="ghost" />}>
          <Plus />
          {m.activity_add_filter()}
        </PopoverTrigger>
        <PopoverPopup align="start">
          <FilterEditor
            onCancel={() => {
              setAdding(false)
            }}
            onSubmit={(filter) => {
              setAdding(false)
              onChange([...filters, filter])
            }}
          />
        </PopoverPopup>
      </Popover>
    </div>
  )
}

function FilterPill({
  filter,
  onChange,
}: {
  filter: LogFilter
  onChange: (filter: LogFilter | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const negated = NEGATED_OPERATORS.has(filter.operator)
  const disabled = filter.disabled === true

  return (
    <Popover
      onOpenChange={(next) => {
        setOpen(next)

        if (!next) {
          setEditing(false)
        }
      }}
      open={open}
    >
      <PopoverTrigger
        sx={[styles.pill, negated && styles.pillNegated, disabled && styles.pillDisabled]}
      >
        {negated ? <span sx={styles.not}>{m.activity_filter_not()}</span> : null}
        <span sx={styles.pillField}>{filter.field}:</span>
        <span sx={styles.pillValue}>{describeValues(filter)}</span>
      </PopoverTrigger>
      <PopoverPopup align="start" key={editing ? "edit" : "actions"}>
        {editing ? (
          <FilterEditor
            initial={filter}
            onCancel={() => {
              setEditing(false)
            }}
            onSubmit={(next) => {
              setOpen(false)
              setEditing(false)
              onChange({ ...next, ...(disabled ? { disabled } : {}) })
            }}
          />
        ) : (
          <div sx={styles.actions}>
            <button
              onClick={() => {
                setEditing(true)
              }}
              sx={styles.action}
              type="button"
            >
              {m.activity_filter_edit()}
            </button>
            <button
              onClick={() => {
                setOpen(false)
                onChange({ ...filter, operator: negateOperator(filter.operator) })
              }}
              sx={styles.action}
              type="button"
            >
              {negated ? m.activity_filter_include() : m.activity_filter_exclude()}
            </button>
            <button
              onClick={() => {
                setOpen(false)

                onChange(disabled ? enableFilter(filter) : { ...filter, disabled: true })
              }}
              sx={styles.action}
              type="button"
            >
              {disabled ? m.activity_filter_enable() : m.activity_filter_disable()}
            </button>
            <button
              onClick={() => {
                setOpen(false)
                onChange(null)
              }}
              sx={[styles.action, styles.actionDanger]}
              type="button"
            >
              <Close size={16} />
              {m.activity_filter_delete()}
            </button>
          </div>
        )}
      </PopoverPopup>
    </Popover>
  )
}

const splitValues = (text: string) =>
  text
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value !== "")
const toValues = (text: string, multi: boolean) => {
  if (multi) {
    return splitValues(text)
  }

  const value = text.trim()

  return value === "" ? [] : [value]
}

function FilterEditor({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: LogFilter
  onSubmit: (filter: LogFilter) => void
  onCancel: () => void
}) {
  const [field, setField] = useState(initial?.field ?? "actor")
  const [operator, setOperator] = useState<FilterOperator>(initial?.operator ?? "is")
  const [text, setText] = useState(initial?.values.join(", ") ?? "")
  const definition = getAuditLogField(field)
  const multi = isMultiValueOperator(operator)
  const valueless = isValuelessOperator(operator)
  const values = toValues(text, multi)
  const prefix = multi ? (text.split(",").at(-1)?.trim() ?? "") : text.trim()
  const remote = useQuery({
    ...auditLogSuggestionsQueryOptions(field, prefix),
    enabled: !valueless && definition?.values === undefined && definition?.suggest === true,
  })
  const suggestions =
    definition?.values?.map((value) => ({ value, label: null, image: null })) ?? remote.data ?? []
  const fields = AUDIT_LOG_FIELDS.some((candidate) => candidate.name === field)
    ? AUDIT_LOG_FIELDS
    : [...AUDIT_LOG_FIELDS, ...(definition === undefined ? [] : [definition])]
  const choose = (value: string) => {
    if (!multi) {
      setText(value)

      return
    }

    const chosen = splitValues(text)

    setText(
      (chosen.includes(value)
        ? chosen.filter((entry) => entry !== value)
        : [...chosen, value]
      ).join(", "),
    )
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()

        if (definition !== undefined && (valueless || values.length > 0)) {
          onSubmit({ field, operator, values: valueless ? [] : values })
        }
      }}
      sx={styles.editor}
    >
      <p sx={styles.title}>
        {initial === undefined ? m.activity_add_filter() : m.activity_filter_edit()}
      </p>
      <div sx={styles.row}>
        <label sx={styles.label}>
          {m.activity_filter_field()}
          <Select
            items={fields.map((candidate) => ({ value: candidate.name, label: candidate.name }))}
            onValueChange={(next) => {
              if (typeof next === "string") {
                setField(next)
                setText("")
              }
            }}
            value={field}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              {fields.map((candidate) => (
                <SelectItem key={candidate.name} value={candidate.name}>
                  <span sx={styles.option}>
                    <FieldTypeChip type={candidate.type} />
                    {candidate.name}
                  </span>
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </label>
        <label sx={styles.label}>
          {m.activity_filter_operator()}
          <Select
            items={FILTER_OPERATORS.map((value) => ({ value, label: OPERATOR_LABELS[value]() }))}
            onValueChange={(next) => {
              const chosen = FILTER_OPERATORS.find((candidate) => candidate === next)

              if (chosen !== undefined) {
                setOperator(chosen)
              }
            }}
            value={operator}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              {FILTER_OPERATORS.map((value) => (
                <SelectItem key={value} value={value}>
                  {OPERATOR_LABELS[value]()}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </label>
      </div>
      {definition === undefined ? null : <p sx={styles.hint}>{describeField(definition)}</p>}
      {valueless ? null : (
        <label sx={styles.label}>
          {multi ? m.activity_filter_values() : m.activity_filter_value()}
          <Input
            autoFocus
            onChange={(event) => {
              setText(event.currentTarget.value)
            }}
            placeholder={
              multi ? m.activity_filter_values_placeholder() : m.activity_filter_value_placeholder()
            }
            value={text}
          />
          {suggestions.length > 0 ? (
            <div sx={styles.chips}>
              {suggestions.slice(0, 12).map(({ value, label, image }) => {
                const name = label ?? value

                return (
                  <button
                    key={value}
                    onClick={() => {
                      choose(value)
                    }}
                    sx={[styles.chip, values.includes(value) && styles.chipSelected]}
                    type="button"
                  >
                    {image !== null && image !== "" ? (
                      <PersonAvatar image={image} name={name} seed={value} size="1rem" />
                    ) : null}
                    <span sx={styles.chipLabel}>{name}</span>
                  </button>
                )
              })}
            </div>
          ) : null}
        </label>
      )}
      <div sx={styles.footer}>
        <Button onClick={onCancel} type="button" variant="ghost">
          {m.activity_cancel()}
        </Button>
        <Button
          disabled={definition === undefined || (!valueless && values.length === 0)}
          type="submit"
        >
          {initial === undefined ? m.activity_add_filter() : m.activity_filter_update()}
        </Button>
      </div>
    </form>
  )
}

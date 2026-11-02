import type * as React from "react"
import * as stylex from "@stylexjs/stylex"
import { useEffect, useRef, useState } from "react"
import type { Sx } from "../../styles/sx"
import { breakpoints, colors, radius } from "../../styles/tokens.stylex"
import { parseTime } from "../../utils/parse-time"
import { Clock } from "../icons"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group"
import { Popover, PopoverPopup, PopoverTrigger } from "./popover"

const HOURS = Array.from({ length: 24 }, (_, index) => index)
const MINUTES = Array.from({ length: 60 }, (_, index) => index)
const MINUTES_IN_DAY = 24 * 60
const pad = (value: number) => String(value).padStart(2, "0")
const toParts = (value: string) => {
  const [hour = 0, minute = 0] = value.split(":").map(Number)

  return { hour, minute }
}
const styles = stylex.create({
  input: {
    fontVariantNumeric: "tabular-nums",
  },
  trigger: {
    borderRadius: radius.md,
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": colors.accent,
    },
    color: colors.mutedForeground,
    cursor: "pointer",
    display: "inline-flex",
    justifyContent: "center",
    outlineStyle: "none",
    transitionProperty: "background-color",
    height: "1.75rem",
    width: "1.75rem",
  },
  popup: {
    width: "var(--anchor-width)",
  },
  columns: {
    margin: "-0.625rem",
    gap: "0.25rem",
    display: "flex",
  },
  column: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  label: {
    paddingBlock: "0.25rem",
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 500,
    textAlign: "center",
  },
  list: {
    gap: "0.125rem",
    overscrollBehavior: "contain",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    scrollbarWidth: "none",
    height: "11.25rem",
    overflowY: "auto",
  },
  option: {
    borderRadius: `calc(${radius.xl} - 0.375rem)`,
    backgroundColor: {
      default: "transparent",
      ":hover": colors.accent,
    },
    color: colors.foreground,
    cursor: "default",
    flexShrink: 0,
    fontSize: {
      default: "1rem",
      [breakpoints.sm]: "0.875rem",
    },
    fontVariantNumeric: "tabular-nums",
    outlineColor: colors.ring,
    outlineOffset: "-2px",
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
    textAlign: "center",
    height: "2.25rem",
  },
  optionSelected: {
    backgroundColor: {
      default: colors.primary,
      ":hover": colors.primary,
    },
    color: colors.primaryForeground,
  },
})

function TimeColumn({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string
  options: number[]
  selected: number
  onSelect: (option: number) => void
}): React.ReactElement {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const list = listRef.current
    const option = list?.querySelector<HTMLElement>('[aria-selected="true"]')

    if (list && option) {
      list.scrollTop = option.offsetTop - (list.clientHeight - option.offsetHeight) / 2
    }
  }, [])

  return (
    <div sx={styles.column}>
      <span aria-hidden sx={styles.label}>
        {label}
      </span>
      <div
        aria-label={label}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
            return
          }

          event.preventDefault()

          const current = event.target instanceof HTMLElement ? event.target : null
          const next =
            event.key === "ArrowDown"
              ? current?.nextElementSibling
              : current?.previousElementSibling

          if (next instanceof HTMLElement) {
            next.focus()
          }
        }}
        ref={listRef}
        role="listbox"
        sx={styles.list}
      >
        {options.map((option) => (
          <button
            aria-selected={option === selected}
            key={option}
            onClick={() => {
              onSelect(option)
            }}
            role="option"
            sx={[styles.option, option === selected && styles.optionSelected]}
            tabIndex={option === selected ? 0 : -1}
            type="button"
          >
            {pad(option)}
          </button>
        ))}
      </div>
    </div>
  )
}

export function TimeInput({
  value,
  onValueChange,
  invalid = false,
  disabled = false,
  labels,
  sx,
}: {
  value: string
  onValueChange: (value: string) => void
  invalid?: boolean
  disabled?: boolean
  labels: { field: string; open: string; hour: string; minute: string }
  sx?: Sx
}): React.ReactElement {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [text, setText] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const { hour, minute } = toParts(value)
  const commit = () => {
    if (text === null) {
      return
    }

    const typed = parseTime(text)

    setText(null)

    if (typed !== null && typed !== value) {
      onValueChange(typed)
    }
  }
  const step = (delta: number) => {
    const total = (hour * 60 + minute + delta + MINUTES_IN_DAY) % MINUTES_IN_DAY

    setText(null)
    onValueChange(`${pad(Math.floor(total / 60))}:${pad(total % 60)}`)
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <InputGroup ref={anchorRef} sx={sx}>
        <InputGroupInput
          aria-invalid={invalid || undefined}
          aria-label={labels.field}
          autoComplete="off"
          disabled={disabled}
          inputMode="text"
          onBlur={commit}
          onChange={(event) => {
            setText(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              commit()
            } else if (event.key === "Escape" && text !== null) {
              event.stopPropagation()
              setText(null)
            } else if (event.key === "ArrowDown" && event.altKey) {
              event.preventDefault()
              commit()
              setOpen(true)
            } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              event.preventDefault()
              step(event.key === "ArrowUp" ? 1 : -1)
            }
          }}
          spellCheck={false}
          sx={styles.input}
          value={text ?? value}
        />
        <InputGroupAddon align="inline-end">
          <PopoverTrigger aria-label={labels.open} disabled={disabled} sx={styles.trigger}>
            <Clock aria-hidden size={16} />
          </PopoverTrigger>
        </InputGroupAddon>
      </InputGroup>
      <PopoverPopup
        align="start"
        anchor={anchorRef}
        collisionAvoidance={{ fallbackAxisSide: "none" }}
        sx={styles.popup}
      >
        <div sx={styles.columns}>
          <TimeColumn
            label={labels.hour}
            onSelect={(next) => {
              onValueChange(`${pad(next)}:${pad(minute)}`)
            }}
            options={HOURS}
            selected={hour}
          />
          <TimeColumn
            label={labels.minute}
            onSelect={(next) => {
              onValueChange(`${pad(hour)}:${pad(next)}`)
            }}
            options={MINUTES}
            selected={minute}
          />
        </div>
      </PopoverPopup>
    </Popover>
  )
}

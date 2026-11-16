import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement, ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Search } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import { type OptionSet, OptionalOptionSelect } from "@/components/fields/option-select"
import { filterContainers } from "@/components/filters/filters.stylex"

const styles = stylex.create({
  toolbar: {
    gap: "0.5rem",
    alignItems: "center",
    // The fields below size themselves against the toolbar, wherever it sits.
    containerType: "inline-size",
    display: "flex",
    flexWrap: "wrap",
  },
  search: {
    flexBasis: { default: "14rem", [filterContainers.narrow]: "100%" },
    flexGrow: 1,
    flexShrink: 1,
    maxWidth: { default: "22rem", [filterContainers.narrow]: "none" },
  },
  select: {
    flexBasis: {
      default: "auto",
      [filterContainers.narrow]: "100%",
      [filterContainers.medium]: "calc(50% - 0.25rem)",
    },
    flexGrow: { default: 0, [filterContainers.narrow]: 1, [filterContainers.medium]: 1 },
    flexShrink: 1,
    minWidth: 0,
  },
  control: {
    height: {
      default: "2.75rem",
      [breakpoints.sm]: "2.5rem",
    },
  },
  toggle: {
    flexBasis: { default: "auto", [filterContainers.narrow]: "100%" },
    flexGrow: { default: 0, [filterContainers.narrow]: 1, [filterContainers.medium]: 1 },
  },
})

export function FilterToolbar({ children }: { children: ReactNode }) {
  return <div sx={styles.toolbar}>{children}</div>
}

export function FilterSearch({
  label,
  value,
  onChange,
}: {
  label: string
  value: string | undefined
  onChange: (search: string | undefined) => void
}) {
  const [input, setInput] = useState(value ?? "")

  return (
    <div sx={styles.search}>
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          aria-label={label}
          onChange={(event) => {
            const next = event.target.value

            setInput(next)
            onChange(next.trim() === "" ? undefined : next.trim())
          }}
          placeholder={label}
          type="search"
          value={input}
        />
      </InputGroup>
    </div>
  )
}

/** A filter of the toolbar: an option set, with "every value" as the empty choice. */
export function FilterSelect<TValue extends string>({
  options,
  values,
  label,
  allLabel,
  value,
  onChange,
}: {
  options: OptionSet<TValue>
  values?: readonly TValue[] | undefined
  label: string
  allLabel: string
  value: TValue | undefined
  onChange: (value: TValue | undefined) => void
}) {
  return (
    <div sx={styles.select}>
      <OptionalOptionSelect
        empty={allLabel}
        label={label}
        onChange={onChange}
        options={options}
        value={value}
        values={values}
      />
    </div>
  )
}

export function FilterToggle({
  icon: Icon,
  label,
  pressed,
  onChange,
}: {
  icon: (props: IconProps) => ReactElement
  label: string
  pressed: boolean
  onChange: (pressed: boolean) => void
}) {
  return (
    <Button
      aria-pressed={pressed}
      onClick={() => {
        onChange(!pressed)
      }}
      sx={[styles.control, styles.toggle]}
      variant={pressed ? "secondary" : "outline"}
    >
      <Icon />
      {label}
    </Button>
  )
}

/** The page's main action, as tall as the filters under it. */
export function PageAction({ render, children }: { render: ReactElement; children: ReactNode }) {
  return (
    <Button render={render} sx={styles.control}>
      {children}
    </Button>
  )
}

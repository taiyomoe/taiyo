import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import type { ReactElement, ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Search } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { breakpoints, colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import { catalogContainers } from "@/features/catalog/lib/catalog.stylex"

const ALL = "ALL"
const styles = stylex.create({
  toolbar: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  search: {
    flexBasis: { default: "14rem", [catalogContainers.narrow]: "100%" },
    flexGrow: 1,
    flexShrink: 1,
    maxWidth: { default: "22rem", [catalogContainers.narrow]: "none" },
  },
  select: {
    flexBasis: {
      default: "auto",
      [catalogContainers.narrow]: "100%",
      [catalogContainers.medium]: "calc(50% - 0.25rem)",
    },
    flexGrow: { default: 0, [catalogContainers.narrow]: 1, [catalogContainers.medium]: 1 },
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
    flexBasis: { default: "auto", [catalogContainers.narrow]: "100%" },
    flexGrow: { default: 0, [catalogContainers.narrow]: 1, [catalogContainers.medium]: 1 },
  },
  option: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  icon: {
    color: colors.mutedForeground,
    flexShrink: 0,
    height: "1rem",
    width: "1rem",
  },
  label: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

export function CatalogToolbar({ children }: { children: ReactNode }) {
  return <div sx={styles.toolbar}>{children}</div>
}

export function CatalogSearch({
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

export function CatalogSelect<TValue extends string>({
  label,
  allLabel,
  icon: Icon,
  options,
  value,
  getLabel,
  renderIcon,
  onChange,
}: {
  label: string
  allLabel: string
  icon: (props: IconProps) => ReactElement
  options: readonly TValue[]
  value: TValue | undefined
  getLabel: (value: TValue) => string
  renderIcon?: (value: TValue) => ReactNode
  onChange: (value: TValue | undefined) => void
}) {
  const option = (choice: TValue | undefined) => (
    <span sx={styles.option}>
      {choice === undefined || renderIcon === undefined ? (
        <Icon {...stylex.props(styles.icon)} />
      ) : (
        renderIcon(choice)
      )}
      <span sx={styles.label}>{choice === undefined ? allLabel : getLabel(choice)}</span>
    </span>
  )

  return (
    <div sx={styles.select}>
      <Select
        onValueChange={(next) => {
          onChange(options.find((candidate) => candidate === next))
        }}
        value={value ?? ALL}
      >
        <SelectTrigger aria-label={label}>
          <SelectValue>{() => option(value)}</SelectValue>
        </SelectTrigger>
        <SelectPopup>
          <SelectItem value={ALL}>{option(undefined)}</SelectItem>
          {options.map((candidate) => (
            <SelectItem key={candidate} value={candidate}>
              {option(candidate)}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </div>
  )
}

export function CatalogToggle({
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
export function CatalogAction({ render, children }: { render: ReactElement; children: ReactNode }) {
  return (
    <Button render={render} sx={styles.control}>
      {children}
    </Button>
  )
}

/** A small colored dot that stands for a status in a select. */
export function StatusDot({ variant }: { variant: BadgeVariant }) {
  return <span aria-hidden sx={[dot.base, dot[variant]]} />
}

const dot = stylex.create({
  base: {
    borderRadius: "50%",
    marginInline: "0.25rem",
    flexShrink: 0,
    height: "0.5rem",
    width: "0.5rem",
  },
  default: { backgroundColor: colors.primary },
  destructive: { backgroundColor: colors.destructive },
  error: { backgroundColor: colors.destructive },
  info: { backgroundColor: colors.info },
  outline: { backgroundColor: colors.mutedForeground },
  secondary: { backgroundColor: colors.mutedForeground },
  success: { backgroundColor: colors.success },
  warning: { backgroundColor: colors.warning },
})

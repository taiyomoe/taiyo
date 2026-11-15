import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Search } from "@taiyomoe/ui/components/icons"
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
import { useState } from "react"

const ALL = "ALL"
const styles = stylex.create({
  toolbar: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  search: {
    flexGrow: 1,
    maxWidth: "24rem",
    minWidth: "14rem",
  },
  select: {
    width: "12rem",
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
  options,
  value,
  getLabel,
  onChange,
}: {
  label: string
  allLabel: string
  options: readonly TValue[]
  value: TValue | undefined
  getLabel: (value: TValue) => string
  onChange: (value: TValue | undefined) => void
}) {
  return (
    <div sx={styles.select}>
      <Select
        onValueChange={(next) => {
          onChange(options.find((option) => option === next))
        }}
        value={value ?? ALL}
      >
        <SelectTrigger aria-label={label}>
          <SelectValue>{() => (value === undefined ? allLabel : getLabel(value))}</SelectValue>
        </SelectTrigger>
        <SelectPopup>
          <SelectItem value={ALL}>{allLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {getLabel(option)}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </div>
  )
}

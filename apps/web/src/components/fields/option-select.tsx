import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  Select,
  type SelectSize,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { createElement } from "react"

export type OptionIcon = (props: IconProps) => ReactElement

/**
 * How one enumeration reads everywhere: its values, their labels and their
 * icons, and the icon of the field itself. Selects, filters and badges all
 * read from the same set, so a value looks the same on every page.
 */
export type OptionSet<T extends string> = {
  values: readonly T[]
  label: (value: T) => string
  icon: (value: T) => OptionIcon
  /** Colors a value's icon, when the color carries meaning. */
  tone?: ((value: T) => Sx) | undefined
  fieldIcon: OptionIcon
}

const NONE = "__none__"
const styles = stylex.create({
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

/** A value's icon with its tone baked in, for components that render icons themselves. */
export const tonedIcon = <T extends string>(options: OptionSet<T>, value: T): OptionIcon => {
  const Icon = options.icon(value)
  const tone = options.tone?.(value)

  if (tone === undefined) {
    return Icon
  }

  function TonedIcon(props: IconProps) {
    return createElement(Icon, { ...props, ...stylex.props(tone) })
  }

  return TonedIcon
}

/** A value's icon alone, colored like everywhere else. */
export function OptionValueIcon<T extends string>({
  options,
  value,
}: {
  options: OptionSet<T>
  value: T
}) {
  return createElement(options.icon(value), {
    "aria-hidden": true,
    ...stylex.props(styles.icon, options.tone === undefined ? null : options.tone(value)),
  })
}

/** A value with its icon, as select triggers, items, filters and tables show it. */
export function OptionLabel<T extends string>({
  options,
  value,
  fallback,
}: {
  options: OptionSet<T>
  value: T | undefined
  /** Shown, with the field icon, when there is no value. */
  fallback?: string | undefined
}) {
  return (
    <span sx={styles.option}>
      {value === undefined ? (
        createElement(options.fieldIcon, { "aria-hidden": true, ...stylex.props(styles.icon) })
      ) : (
        <OptionValueIcon options={options} value={value} />
      )}
      <span sx={styles.label}>{value === undefined ? fallback : options.label(value)}</span>
    </span>
  )
}

type BaseProps<T extends string> = {
  options: OptionSet<T>
  label: string
  /** The values offered, when only some of the set apply. */
  values?: readonly T[] | undefined
  size?: SelectSize | undefined
  disabled?: boolean | undefined
  sx?: Sx
}

function OptionSelectBase<T extends string>({
  options,
  label,
  values = options.values,
  size,
  disabled,
  sx,
  value,
  empty,
  onPick,
}: BaseProps<T> & {
  value: T | undefined
  empty: string | undefined
  onPick: (value: T | undefined) => void
}) {
  return (
    <Select
      disabled={disabled}
      onValueChange={(next) => {
        onPick(values.find((candidate) => candidate === next))
      }}
      value={value ?? NONE}
    >
      <SelectTrigger aria-label={label} size={size ?? "default"} sx={sx}>
        <SelectValue>
          {() => <OptionLabel fallback={empty} options={options} value={value} />}
        </SelectValue>
      </SelectTrigger>
      <SelectPopup>
        {empty === undefined ? null : (
          <SelectItem value={NONE}>
            <OptionLabel fallback={empty} options={options} value={undefined} />
          </SelectItem>
        )}
        {values.map((option) => (
          <SelectItem key={option} value={option}>
            <OptionLabel options={options} value={option} />
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  )
}

/** The one select for an enumeration, with the same icons on every page. */
export function OptionSelect<T extends string>({
  value,
  onChange,
  ...props
}: BaseProps<T> & { value: T; onChange: (value: T) => void }) {
  return (
    <OptionSelectBase
      {...props}
      empty={undefined}
      onPick={(next) => {
        if (next !== undefined) {
          onChange(next)
        }
      }}
      value={value}
    />
  )
}

/** The same select with a first option that stands for no value: every value in a filter, no change in a bulk edit. */
export function OptionalOptionSelect<T extends string>({
  empty,
  onChange,
  ...props
}: BaseProps<T> & {
  value: T | undefined
  onChange: (value: T | undefined) => void
  empty: string
}) {
  return <OptionSelectBase {...props} empty={empty} onPick={onChange} />
}

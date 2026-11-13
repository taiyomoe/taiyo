import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@taiyomoe/ui/components/ui/segmented-control"
import { Slider } from "@taiyomoe/ui/components/ui/slider"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { useId } from "react"

const styles = stylex.create({
  section: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  field: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  labelRow: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 500,
    justifyContent: "space-between",
  },
  value: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
  },
  hint: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    lineHeight: 1.45,
  },
  switchRow: {
    gap: "1rem",
    alignItems: "center",
    cursor: "pointer",
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 500,
    justifyContent: "space-between",
  },
})

export function SettingSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section sx={styles.section}>
      <h3 sx={styles.heading}>{title}</h3>
      {children}
    </section>
  )
}

function SettingHint({ children }: { children: ReactNode }) {
  return <p sx={styles.hint}>{children}</p>
}

export function SettingField({
  label,
  value,
  hint,
  children,
}: {
  label: string
  value?: string | undefined
  hint?: string | undefined
  children: ReactNode
}) {
  return (
    <div sx={styles.field}>
      <div sx={styles.labelRow}>
        <span>{label}</span>
        {value === undefined ? null : <span sx={styles.value}>{value}</span>}
      </div>
      {children}
      {hint === undefined ? null : <SettingHint>{hint}</SettingHint>}
    </div>
  )
}

export function SettingSwitch({
  label,
  hint,
  checked,
  disabled = false,
  onChange,
}: {
  label: string
  hint?: string | undefined
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div sx={styles.field}>
      <label sx={styles.switchRow}>
        {label}
        <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
      </label>
      {hint === undefined ? null : <SettingHint>{hint}</SettingHint>}
    </div>
  )
}

export function SettingSlider({
  label,
  hint,
  value,
  format,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  hint?: string | undefined
  value: number
  format: (value: number) => string
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}) {
  const id = useId()

  return (
    <SettingField hint={hint} label={label} value={format(value)}>
      <Slider
        aria-labelledby={id}
        max={max}
        min={min}
        onValueChange={(next: number | readonly number[]) => {
          onChange(typeof next === "number" ? next : (next[0] ?? value))
        }}
        step={step}
        value={value}
      />
      <span hidden id={id}>
        {label}
      </span>
    </SettingField>
  )
}

export function SettingChoice<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string
  hint?: string | undefined
  value: T
  options: ReadonlyArray<{ value: T; label: string }>
  onChange: (value: T) => void
}) {
  return (
    <SettingField hint={hint} label={label}>
      <SegmentedControl
        aria-label={label}
        fullWidth
        onValueChange={(next: unknown) => {
          const selected = options.find((option) => option.value === next)

          if (selected !== undefined) {
            onChange(selected.value)
          }
        }}
        value={value}
      >
        {options.map((option) => (
          <SegmentedControlItem key={option.value} size="sm" value={option.value}>
            {option.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </SettingField>
  )
}

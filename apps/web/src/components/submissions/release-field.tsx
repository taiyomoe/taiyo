import * as stylex from "@stylexjs/stylex"
import { Field, FieldDescription, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import { Tabs, TabsList, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { DateTimePicker } from "@/components/fields/date-time-picker"
import {
  RELEASE_MODES,
  RELEASE_UNITS,
  type ReleaseMode,
  type ReleaseSettings,
  type ReleaseUnit,
} from "@/lib/chapter-batch/release"
import { m } from "@/paraglide/messages"

const MODE_LABELS: Record<ReleaseMode, () => string> = {
  now: m.upload_release_now,
  date: m.upload_release_date,
  delay: m.upload_release_delay,
}
const UNIT_LABELS: Record<ReleaseUnit, () => string> = {
  hours: m.upload_unit_hours,
  days: m.upload_unit_days,
}
const styles = stylex.create({
  tabs: {
    width: "100%",
  },
  tab: {
    flexGrow: 1,
  },
  amount: {
    gap: "0.5rem",
    alignItems: "center",
    display: "grid",
    gridTemplateColumns: "5rem minmax(0, 1fr)",
  },
  spacing: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
  },
  switch: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.875rem",
  },
  caption: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
})

function AmountInput({
  amount,
  unit,
  invalid,
  onChange,
}: {
  amount: string
  unit: ReleaseUnit
  invalid: boolean
  onChange: (patch: { amount?: string; unit?: ReleaseUnit }) => void
}) {
  return (
    <div sx={styles.amount}>
      <Input
        aria-invalid={invalid || undefined}
        aria-label={m.upload_release_amount()}
        inputMode="decimal"
        onChange={(event) => {
          onChange({ amount: event.target.value })
        }}
        value={amount}
      />
      <Select
        onValueChange={(next: ReleaseUnit | null) => {
          if (next !== null) {
            onChange({ unit: next })
          }
        }}
        value={unit}
      >
        <SelectTrigger aria-label={m.upload_release_unit()}>
          <SelectValue>{() => UNIT_LABELS[unit]()}</SelectValue>
        </SelectTrigger>
        <SelectPopup>
          {RELEASE_UNITS.map((value) => (
            <SelectItem key={value} value={value}>
              {UNIT_LABELS[value]()}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </div>
  )
}

export function ReleaseField({
  value,
  onChange,
  chapters,
  error,
}: {
  value: ReleaseSettings
  onChange: (patch: Partial<ReleaseSettings>) => void
  chapters: number
  error: string | null
}) {
  return (
    <Field invalid={error !== null}>
      <FieldLabel>{m.upload_release()}</FieldLabel>
      <Tabs
        onValueChange={(mode: ReleaseMode) => {
          onChange({ mode })
        }}
        sx={styles.tabs}
        value={value.mode}
      >
        <TabsList aria-label={m.upload_release_mode()} sx={styles.tabs}>
          {RELEASE_MODES.map((mode) => (
            <TabsTab key={mode} sx={styles.tab} value={mode}>
              {MODE_LABELS[mode]()}
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
      {value.mode === "date" ? (
        <DateTimePicker
          invalid={error !== null}
          label={m.upload_release_date()}
          onChange={(date) => {
            onChange({ date })
          }}
          value={value.date}
        />
      ) : null}
      {value.mode === "delay" ? (
        <>
          <span sx={styles.caption}>{m.upload_release_in()}</span>
          <AmountInput
            amount={value.delay}
            invalid={error !== null}
            onChange={({ amount, unit }) => {
              onChange({ delay: amount ?? value.delay, delayUnit: unit ?? value.delayUnit })
            }}
            unit={value.delayUnit}
          />
        </>
      ) : null}
      {value.mode !== "now" && chapters > 1 ? (
        <div sx={styles.spacing}>
          <label sx={styles.switch}>
            <Switch
              checked={value.spaced}
              onCheckedChange={(spaced) => {
                onChange({ spaced })
              }}
            />
            {m.upload_release_spacing()}
          </label>
          {value.spaced ? (
            <>
              <span sx={styles.caption}>{m.upload_release_every()}</span>
              <AmountInput
                amount={value.spacing}
                invalid={false}
                onChange={({ amount, unit }) => {
                  onChange({
                    spacing: amount ?? value.spacing,
                    spacingUnit: unit ?? value.spacingUnit,
                  })
                }}
                unit={value.spacingUnit}
              />
              <span sx={styles.caption}>{m.upload_release_spacing_description()}</span>
            </>
          ) : null}
        </div>
      ) : null}
      <FieldDescription>
        {value.mode === "now"
          ? m.upload_release_now_description()
          : m.upload_release_scheduled_description()}
      </FieldDescription>
      {error === null ? null : <FieldError match>{error}</FieldError>}
    </Field>
  )
}

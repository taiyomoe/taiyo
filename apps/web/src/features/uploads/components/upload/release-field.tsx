import * as stylex from "@stylexjs/stylex"
import { Field, FieldDescription, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import { Tabs, TabsList, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { DateTimePicker } from "@/components/fields/date-time-picker"
import { AmountInput } from "@/features/uploads/components/upload/amount-input"
import {
  RELEASE_MODES,
  type ReleaseMode,
  type ReleaseSettings,
} from "@/features/uploads/lib/chapter-batch/release"
import { m } from "@/paraglide/messages"

type ReleaseFieldProps = {
  release: ReleaseSettings
  error: string | null
  rowCount: number
  onChange: (patch: Partial<ReleaseSettings>) => void
}

const MODE_LABELS: Record<ReleaseMode, () => string> = {
  now: m.upload_release_now,
  date: m.upload_release_date,
  delay: m.upload_release_delay,
}
const styles = stylex.create({
  tabs: {
    width: "100%",
  },
  tab: {
    flexGrow: 1,
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

export function ReleaseField({ release, error, rowCount, onChange }: ReleaseFieldProps) {
  return (
    <Field invalid={error !== null}>
      <FieldLabel>{m.upload_release()}</FieldLabel>
      <Tabs
        onValueChange={(mode: ReleaseMode) => {
          onChange({ mode })
        }}
        sx={styles.tabs}
        value={release.mode}
      >
        <TabsList aria-label={m.upload_release_mode()} sx={styles.tabs}>
          {RELEASE_MODES.map((mode) => (
            <TabsTab key={mode} sx={styles.tab} value={mode}>
              {MODE_LABELS[mode]()}
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
      {release.mode === "date" ? (
        <DateTimePicker
          invalid={error !== null}
          label={m.upload_release_date()}
          onChange={(date) => {
            onChange({ date })
          }}
          value={release.date}
        />
      ) : null}
      {release.mode === "delay" ? (
        <>
          <span sx={styles.caption}>{m.upload_release_in()}</span>
          <AmountInput
            amount={release.delay}
            invalid={error !== null}
            onChange={({ amount, unit }) => {
              onChange({
                delay: amount ?? release.delay,
                delayUnit: unit ?? release.delayUnit,
              })
            }}
            unit={release.delayUnit}
          />
        </>
      ) : null}
      {release.mode !== "now" && rowCount > 1 ? (
        <div sx={styles.spacing}>
          <label sx={styles.switch}>
            <Switch
              checked={release.spaced}
              onCheckedChange={(spaced) => {
                onChange({ spaced })
              }}
            />
            {m.upload_release_spacing()}
          </label>
          {release.spaced ? (
            <>
              <span sx={styles.caption}>{m.upload_release_every()}</span>
              <AmountInput
                amount={release.spacing}
                invalid={false}
                onChange={({ amount, unit }) => {
                  onChange({
                    spacing: amount ?? release.spacing,
                    spacingUnit: unit ?? release.spacingUnit,
                  })
                }}
                unit={release.spacingUnit}
              />
              <span sx={styles.caption}>{m.upload_release_spacing_description()}</span>
            </>
          ) : null}
        </div>
      ) : null}
      <FieldDescription>
        {release.mode === "now"
          ? m.upload_release_now_description()
          : m.upload_release_scheduled_description()}
      </FieldDescription>
      {error === null ? null : <FieldError match>{error}</FieldError>}
    </Field>
  )
}

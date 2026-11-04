import * as stylex from "@stylexjs/stylex"
import { Calendar } from "@taiyomoe/ui/components/ui/calendar"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { dateRangeStyles } from "@/features/activity-log/components/date-range/date-range-styles"
import { formatDateTime } from "@/features/activity-log/lib/format"
import { m } from "@/paraglide/messages"

const pad = (value: number) => String(value).padStart(2, "0")
const styles = stylex.create({
  calendar: {
    alignSelf: "center",
  },
  timeRow: {
    gap: "0.5rem",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 9.75rem",
  },
})

export function AbsoluteTab({
  resolved,
  text,
  onTextChange,
  onApply,
}: {
  resolved: Date
  text: string
  onTextChange: (text: string) => void
  onApply: (value: string) => void
}) {
  const applyDate = (date: Date) => {
    onTextChange(formatDateTime(date))
    onApply(date.toISOString())
  }

  return (
    <div sx={dateRangeStyles.panel}>
      <Calendar
        defaultMonth={resolved}
        mode="single"
        onSelect={(day) => {
          if (day !== undefined) {
            const next = new Date(day)

            next.setHours(resolved.getHours(), resolved.getMinutes(), resolved.getSeconds(), 0)
            applyDate(next)
          }
        }}
        selected={resolved}
        {...stylex.props(styles.calendar)}
      />
      <div sx={styles.timeRow}>
        <Input
          aria-label={m.activity_date_text()}
          onChange={(event) => {
            onTextChange(event.currentTarget.value)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              const date = new Date(text)

              if (!Number.isNaN(date.getTime())) {
                applyDate(date)
              }
            }
          }}
          value={text}
        />
        <Input
          aria-label={m.activity_time()}
          onChange={(event) => {
            const [hours = 0, minutes = 0, seconds = 0] = event.currentTarget.value
              .split(":")
              .map(Number)
            const next = new Date(resolved)

            next.setHours(hours, minutes, seconds, 0)

            if (!Number.isNaN(next.getTime())) {
              applyDate(next)
            }
          }}
          step={1}
          type="time"
          value={`${pad(resolved.getHours())}:${pad(resolved.getMinutes())}:${pad(resolved.getSeconds())}`}
        />
      </div>
    </div>
  )
}

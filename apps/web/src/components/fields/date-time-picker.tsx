import * as stylex from "@stylexjs/stylex"
import { CalendarClock } from "@taiyomoe/ui/components/icons"
import { Calendar } from "@taiyomoe/ui/components/ui/calendar"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { SelectButton } from "@taiyomoe/ui/components/ui/select"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  trigger: {
    width: "100%",
  },
  value: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  icon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  placeholder: {
    color: colors.mutedForeground,
  },
  popup: {
    gap: "0.75rem",
    paddingInline: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  time: {
    gap: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.875rem",
    justifyContent: "space-between",
  },
  timeInput: {
    width: "7.5rem",
  },
})
const pad = (value: number) => String(value).padStart(2, "0")
const timeOf = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`
const nextHour = () => {
  const date = new Date()

  date.setHours(date.getHours() + 1, 0, 0, 0)

  return date
}
const withTime = (day: Date, time: string) => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number)
  const next = new Date(day)

  next.setHours(hours, minutes, 0, 0)

  return next
}
const startOfToday = () => {
  const date = new Date()

  date.setHours(0, 0, 0, 0)

  return date
}

export const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat(getLocale(), { dateStyle: "medium", timeStyle: "short" }).format(date)

export function DateTimePicker({
  value,
  onChange,
  invalid = false,
  label,
}: {
  value: Date | null
  onChange: (value: Date) => void
  invalid?: boolean
  label: string
}) {
  const time = timeOf(value ?? nextHour())

  return (
    <Popover>
      <PopoverTrigger
        aria-invalid={invalid || undefined}
        aria-label={label}
        render={<SelectButton sx={styles.trigger} />}
      >
        <span sx={styles.value}>
          <CalendarClock size={16} {...stylex.props(styles.icon)} />
          {value === null ? (
            <span sx={styles.placeholder}>{m.date_picker_placeholder()}</span>
          ) : (
            formatDateTime(value)
          )}
        </span>
      </PopoverTrigger>
      <PopoverPopup align="start">
        <div sx={styles.popup}>
          <Calendar
            {...(value === null ? {} : { defaultMonth: value, selected: value })}
            disabled={{ before: startOfToday() }}
            mode="single"
            onSelect={(day) => {
              if (day !== undefined) {
                onChange(withTime(day, time))
              }
            }}
          />
          <label sx={styles.time}>
            {m.date_picker_time()}
            <Input
              onChange={(event) => {
                if (event.target.value !== "") {
                  onChange(withTime(value ?? nextHour(), event.target.value))
                }
              }}
              size="sm"
              sx={styles.timeInput}
              type="time"
              value={time}
            />
          </label>
        </div>
      </PopoverPopup>
    </Popover>
  )
}

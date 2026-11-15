import * as stylex from "@stylexjs/stylex"
import { CalendarClock } from "@taiyomoe/ui/components/icons"
import { Calendar } from "@taiyomoe/ui/components/ui/calendar"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { SelectButton } from "@taiyomoe/ui/components/ui/select"
import { TimeInput } from "@taiyomoe/ui/components/ui/time-input"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useNow } from "@/hooks/use-now"
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
    width: "var(--anchor-width, 20rem)",
  },
  content: {
    gap: "0.75rem",
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
    flex: "1",
    minWidth: 0,
  },
})
const pad = (value: number) => String(value).padStart(2, "0")
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
  const now = useNow()
  const shown = value ?? nextHour()
  const time = `${pad(shown.getHours())}:${pad(shown.getMinutes())}`

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
      <PopoverPopup
        align="start"
        collisionAvoidance={{ fallbackAxisSide: "none" }}
        sx={styles.popup}
      >
        <div sx={styles.content}>
          <Calendar
            fullWidth
            {...(value === null ? {} : { defaultMonth: value, selected: value })}
            disabled={{ before: new Date(new Date(now).setHours(0, 0, 0, 0)) }}
            mode="single"
            onSelect={(day) => {
              if (day !== undefined) {
                onChange(withTime(day, time))
              }
            }}
          />
          <div sx={styles.time}>
            <span aria-hidden>{m.date_picker_time()}</span>
            <TimeInput
              labels={{
                field: m.date_picker_time(),
                hour: m.date_picker_hour(),
                minute: m.date_picker_minute(),
                open: m.date_picker_open_time(),
              }}
              onValueChange={(next) => {
                onChange(withTime(value ?? nextHour(), next))
              }}
              sx={styles.timeInput}
              value={time}
            />
          </div>
        </div>
      </PopoverPopup>
    </Popover>
  )
}

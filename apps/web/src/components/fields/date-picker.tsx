import * as stylex from "@stylexjs/stylex"
import { Calendar as CalendarIcon } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Calendar } from "@taiyomoe/ui/components/ui/calendar"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { SelectButton } from "@taiyomoe/ui/components/ui/select"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
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
})
const FIRST_YEAR = 1900

/** Picks a calendar day, any year, with no time of day. */
export function DatePicker({
  value,
  onChange,
  label,
}: {
  value: Date | null
  onChange: (value: Date | null) => void
  label: string
}) {
  const now = useNow()
  const [open, setOpen] = useState(false)

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger aria-label={label} render={<SelectButton sx={styles.trigger} />}>
        <span sx={styles.value}>
          <CalendarIcon size={16} {...stylex.props(styles.icon)} />
          {value === null ? (
            <span sx={styles.placeholder}>{m.date_picker_placeholder()}</span>
          ) : (
            new Intl.DateTimeFormat(getLocale(), { dateStyle: "long" }).format(value)
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
            captionLayout="dropdown"
            endMonth={new Date(new Date(now).getFullYear() + 10, 11)}
            fullWidth
            lang={getLocale()}
            startMonth={new Date(FIRST_YEAR, 0)}
            {...(value === null ? {} : { defaultMonth: value, selected: value })}
            mode="single"
            onSelect={(day) => {
              if (day !== undefined) {
                onChange(day)
                setOpen(false)
              }
            }}
          />
          {value === null ? null : (
            <Button
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
              size="sm"
              variant="outline"
            >
              {m.date_picker_clear()}
            </Button>
          )}
        </div>
      </PopoverPopup>
    </Popover>
  )
}

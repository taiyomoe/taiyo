import * as stylex from "@stylexjs/stylex"
import type * as React from "react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/utils/cn"
import { ChevronLeft, ChevronRight, ChevronsUpDown } from "@/components/icons"
import { calendarDayMarker } from "../../styles/markers.stylex"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"

const styles = stylex.create({
  root: {
    // The cell size drives every grid track below.
    "--cell-size": {
      default: "2.5rem",
      [consts.sm]: "2.25rem",
    },
    width: "fit-content",
  },
  navButton: {
    borderRadius: radius.lg,
    alignItems: "center",
    backgroundColor: {
      default: null,
      ":hover": colors.accent,
    },
    color: colors.foreground,
    display: "flex",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    justifyContent: "center",
    opacity: {
      default: null,
      ":disabled": 0.64,
    },
    pointerEvents: {
      default: null,
      ":disabled": "none",
    },
    position: "relative",
    height: "var(--cell-size)",
    width: "var(--cell-size)",
  },
  captionLabel: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    fontWeight: 500,
    height: "100%",
  },
  day: {
    // A day is a square cell, so `radius.full` gives a disc — and a range,
    // whose inner corners are squared in structural.css, gets round caps.
    borderRadius: radius.full,
    paddingBlock: "1px",
    fontSize: "0.875rem",
    height: "var(--cell-size)",
    width: "var(--cell-size)",
  },
  dayButton: {
    borderRadius: "inherit",
    alignItems: "center",
    backgroundColor: {
      default: null,
      [stylex.when.ancestor("[data-selected]", calendarDayMarker)]: colors.primary,
      ":hover": colors.accent,
    },
    color: {
      default: colors.foreground,
      [stylex.when.ancestor("[data-disabled]", calendarDayMarker)]:
        `color-mix(in srgb, ${colors.mutedForeground} 72%, transparent)`,
      [stylex.when.ancestor("[data-outside]", calendarDayMarker)]:
        `color-mix(in srgb, ${colors.mutedForeground} 72%, transparent)`,
      [stylex.when.ancestor("[data-selected]", calendarDayMarker)]: colors.primaryForeground,
    },
    display: "flex",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    justifyContent: "center",
    outlineColor: `color-mix(in srgb, ${colors.ring} 50%, transparent)`,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 3,
    pointerEvents: {
      default: null,
      [stylex.when.ancestor("[data-disabled]", calendarDayMarker)]: "none",
    },
    position: "relative",
    textDecorationLine: {
      default: null,
      [stylex.when.ancestor("[data-disabled]", calendarDayMarker)]: "line-through",
    },
    transitionProperty: "color, background-color, border-radius, box-shadow",
    zIndex: {
      default: null,
      ":focus-visible": 1,
    },
    height: "var(--cell-size)",
    width: "var(--cell-size)",
  },
  // Range pieces square the inner corners; the button inherits the radius.
  rangeStart: {
    borderEndEndRadius: 0,
    borderStartEndRadius: 0,
  },
  rangeMiddle: {
    borderRadius: 0,
    backgroundColor: colors.accent,
    color: colors.foreground,
  },
  rangeEnd: {
    borderEndStartRadius: 0,
    borderStartStartRadius: 0,
  },
  dropdown: {
    inset: 0,
    backgroundColor: colors.popover,
    opacity: 0,
    position: "absolute",
  },
  dropdownRoot: {
    borderColor: {
      default: colors.input,
      ":focus-within": colors.ring,
    },
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    paddingInline: "calc(0.75rem - 1px)",
    boxShadow: shadows.chip,
    outlineColor: `color-mix(in srgb, ${colors.ring} 50%, transparent)`,
    outlineStyle: {
      default: "none",
      ":focus-within": "solid",
    },
    outlineWidth: 3,
    position: "relative",
    height: {
      default: "2.25rem",
      [consts.sm]: "2rem",
    },
  },
  dropdowns: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    justifyContent: "center",
    height: "var(--cell-size)",
    width: "100%",
  },
  hidden: {
    visibility: "hidden",
  },
  month: {
    width: "100%",
  },
  monthCaption: {
    marginInline: "var(--cell-size)",
    paddingInline: "0.25rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    position: "relative",
    zIndex: 2,
    height: "var(--cell-size)",
    marginBottom: "0.25rem",
  },
  months: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: {
      default: "column",
      [consts.sm]: "row",
    },
    position: "relative",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    position: "absolute",
    zIndex: 1,
    top: 0,
    width: "100%",
  },
  outside: {
    backgroundColor: {
      "[data-selected]": `color-mix(in srgb, ${colors.accent} 50%, transparent)`,
      default: null,
    },
    color: colors.mutedForeground,
  },
  weekday: {
    padding: 0,
    color: `color-mix(in srgb, ${colors.mutedForeground} 72%, transparent)`,
    fontSize: "0.75rem",
    fontWeight: 500,
    height: "var(--cell-size)",
    width: "var(--cell-size)",
  },
  chevron: {
    flexShrink: 0,
    opacity: 0.8,
    pointerEvents: "none",
    height: {
      default: "1.125rem",
      [consts.sm]: "1rem",
    },
    width: {
      default: "1.125rem",
      [consts.sm]: "1rem",
    },
  },
})

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents,
  mode = "single",
  ...props
}: React.ComponentProps<typeof DayPicker>): React.ReactElement {
  const rootProps = stylex.props(styles.root)
  const navButtonClassName = stylex.props(styles.navButton).className ?? ""
  const chevronProps = stylex.props(styles.chevron)
  const defaultClassNames = {
    button_next: navButtonClassName,
    button_previous: navButtonClassName,
    caption_label: stylex.props(styles.captionLabel).className ?? "",
    day: stylex.props(styles.day, calendarDayMarker).className ?? "",
    day_button: stylex.props(styles.dayButton).className ?? "",
    dropdown: stylex.props(styles.dropdown).className ?? "",
    dropdown_root: stylex.props(styles.dropdownRoot).className ?? "",
    dropdowns: stylex.props(styles.dropdowns).className ?? "",
    hidden: stylex.props(styles.hidden).className ?? "",
    month: stylex.props(styles.month).className ?? "",
    month_caption: stylex.props(styles.monthCaption).className ?? "",
    months: stylex.props(styles.months).className ?? "",
    nav: stylex.props(styles.nav).className ?? "",
    outside: stylex.props(styles.outside).className ?? "",
    // `range-*` stay as plain hooks: structural.css uses them for the "today"
    // dot, which has to reach the day button's ::after layer.
    range_end: cn("range-end", stylex.props(styles.rangeEnd).className),
    range_middle: cn("range-middle", stylex.props(styles.rangeMiddle).className),
    range_start: cn("range-start", stylex.props(styles.rangeStart).className),
    today: "calendar-today",
    week_number: stylex.props(styles.weekday).className ?? "",
    weekday: stylex.props(styles.weekday).className ?? "",
  }
  const mergedClassNames: typeof defaultClassNames = Object.keys(defaultClassNames).reduce(
    (acc, key) => {
      const userClass = classNames?.[key as keyof typeof classNames]
      const baseClass = defaultClassNames[key as keyof typeof defaultClassNames]

      acc[key as keyof typeof defaultClassNames] = userClass ? cn(baseClass, userClass) : baseClass

      return acc
    },
    { ...defaultClassNames } as typeof defaultClassNames,
  )
  const defaultComponents = {
    Chevron: ({
      className: chevronClassName,
      orientation,
      ...chevronRest
    }: {
      className?: string
      orientation?: "left" | "right" | "up" | "down"
    }): React.ReactElement => {
      const merged = cn(chevronProps.className, chevronClassName)

      if (orientation === "left") {
        return (
          <ChevronLeft
            className={merged}
            style={chevronProps.style}
            {...chevronRest}
            aria-hidden="true"
          />
        )
      }

      if (orientation === "right") {
        return (
          <ChevronRight
            className={merged}
            style={chevronProps.style}
            {...chevronRest}
            aria-hidden="true"
          />
        )
      }

      return (
        <ChevronsUpDown
          className={merged}
          style={chevronProps.style}
          {...chevronRest}
          aria-hidden="true"
        />
      )
    },
  }
  const mergedComponents = {
    ...defaultComponents,
    ...userComponents,
  }
  const dayPickerProps = {
    className: cn(rootProps.className, className),
    classNames: mergedClassNames,
    components: mergedComponents,
    "data-slot": "calendar",
    formatters: {
      formatMonthDropdown: (date: Date) => date.toLocaleString("default", { month: "short" }),
    } as React.ComponentProps<typeof DayPicker>["formatters"],
    mode,
    showOutsideDays,
    style: rootProps.style,
    ...props,
  }

  return <DayPicker {...(dayPickerProps as React.ComponentProps<typeof DayPicker>)} />
}

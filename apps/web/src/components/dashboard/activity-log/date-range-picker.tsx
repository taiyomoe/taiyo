import * as stylex from "@stylexjs/stylex"
import {
  ArrowRight,
  Calendar as CalendarIcon,
  ChevronDown,
  Refresh,
  Spinner,
} from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Calendar } from "@taiyomoe/ui/components/ui/calendar"
import { Input } from "@taiyomoe/ui/components/ui/input"
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@taiyomoe/ui/components/ui/number-field"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors, font, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState, useSyncExternalStore } from "react"
import {
  COMMON_RANGES,
  describeDateMath,
  describeRange,
  formatDateTime,
  formatDuration,
  unitName,
  unitSingular,
} from "@/components/dashboard/activity-log/format"
import { REFRESH_INTERVALS, type RefreshInterval } from "@/lib/activity-log"
import {
  DATE_MATH_UNITS,
  type DateMathUnit,
  parseDateMath,
  resolveDateMath,
  toDateMath,
} from "@/lib/datemath"
import { useNow } from "@/lib/use-now"
import { m } from "@/paraglide/messages"

type Range = { from: string; to: string }

const RECENT_KEY = "taiyo:activity-log:recent-ranges"
const RECENT_LIMIT = 5
const QUICK_UNITS: readonly DateMathUnit[] = ["s", "m", "h", "d", "w", "M", "y"]
const styles = stylex.create({
  root: {
    gap: "0.5rem",
    alignItems: "stretch",
    display: "flex",
  },
  group: {
    borderColor: colors.input,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "stretch",
    backgroundClip: "padding-box",
    backgroundColor: colors.field,
    boxShadow: shadows.chip,
    display: "flex",
    flexBasis: "16rem",
    flexGrow: "1",
    flexShrink: "1",
    position: "relative",
    minHeight: "2.75rem",
    minWidth: 0,
  },
  segment: {
    borderWidth: 0,
    gap: "0.5rem",
    paddingInline: "0.875rem",
    alignItems: "center",
    backgroundColor: {
      "[data-popup-open]": colors.chipHover,
      default: "transparent",
      ":hover": colors.chipHover,
    },
    color: colors.foreground,
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
    outlineColor: colors.ring,
    outlineOffset: -2,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
    transitionDuration: motion.enter,
    transitionProperty: "background-color",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  quick: {
    paddingInline: "0.75rem",
    borderEndStartRadius: `calc(${radius.xl} - 1px)`,
    borderInlineEndColor: colors.border,
    borderInlineEndStyle: "solid",
    borderInlineEndWidth: 1,
    borderStartStartRadius: `calc(${radius.xl} - 1px)`,
    color: colors.mutedForeground,
  },
  rangeSegment: {
    flex: "1",
    justifyContent: "flex-start",
  },
  last: {
    borderEndEndRadius: `calc(${radius.xl} - 1px)`,
    borderStartEndRadius: `calc(${radius.xl} - 1px)`,
  },
  edge: {
    overflow: "hidden",
    flexBasis: "auto",
    flexGrow: "1",
    flexShrink: "1",
    justifyContent: "center",
    textOverflow: "ellipsis",
  },
  arrow: {
    marginInline: "0.125rem",
    alignSelf: "center",
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  rangeText: {
    gap: "0.5rem",
    alignItems: "baseline",
    display: "flex",
    flexGrow: 1,
    minWidth: 0,
  },
  showDates: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    marginInlineStart: "auto",
  },
  refresh: {
    flexShrink: 0,
    minHeight: "2.75rem",
  },
  refreshLabel: {
    display: {
      default: "none",
      "@container (width >= 40rem)": "inline",
    },
  },
  spin: {
    animationDuration: "900ms",
    animationIterationCount: "infinite",
    animationName: stylex.keyframes({ to: { transform: "rotate(360deg)" } }),
    animationTimingFunction: "linear",
  },
  menu: {
    padding: "0.5rem",
    gap: "1.125rem",
    display: "flex",
    flexDirection: "column",
    width: "min(28rem, calc(100vw - 2rem))",
  },
  section: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
  },
  sectionTitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  quickRow: {
    gap: "0.5rem",
    alignItems: "center",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 4.5rem minmax(0, 1.2fr) auto",
  },
  fit: {
    minWidth: 0,
    width: "100%",
  },
  common: {
    rowGap: "0.125rem",
    columnGap: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  link: {
    borderRadius: radius.md,
    borderWidth: 0,
    paddingBlock: "0.4375rem",
    paddingInline: "0.5rem",
    backgroundColor: {
      default: "transparent",
      ":hover": colors.accent,
    },
    color: colors.foreground,
    cursor: "pointer",
    fontSize: "0.875rem",
    textAlign: "start",
  },
  linkActive: {
    color: colors.primary,
    fontWeight: 600,
  },
  empty: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
  refreshRow: {
    gap: "0.75rem",
    alignItems: "center",
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
  },
  datePopup: {
    padding: "0.25rem",
    gap: "0.875rem",
    display: "flex",
    flexDirection: "column",
    width: "min(21rem, calc(100vw - 2rem))",
  },
  panel: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
    paddingTop: "0.75rem",
  },
  calendar: {
    alignSelf: "center",
  },
  timeRow: {
    gap: "0.5rem",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 9.75rem",
  },
  relativeRow: {
    gap: "0.5rem",
    display: "grid",
    gridTemplateColumns: "8.75rem minmax(0, 1fr)",
  },
  toggle: {
    gap: "0.625rem",
    alignItems: "center",
    cursor: "pointer",
    display: "flex",
    fontSize: "0.875rem",
  },
  preview: {
    borderRadius: radius.lg,
    paddingBlock: "0.625rem",
    paddingInline: "0.75rem",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
  },
  nowText: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: 1.5,
  },
})
const sameRange = (a: Range, b: Range) => a.from === b.from && a.to === b.to
const isRange = (value: unknown): value is Range =>
  typeof value === "object" &&
  value !== null &&
  "from" in value &&
  "to" in value &&
  typeof value.from === "string" &&
  typeof value.to === "string"
const NO_RANGES: Range[] = []
const listeners = new Set<() => void>()
let cached: { raw: string | null; ranges: Range[] } = { raw: null, ranges: NO_RANGES }
const parseRecent = (raw: string | null): Range[] => {
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]")

    return Array.isArray(parsed) ? parsed.filter(isRange).slice(0, RECENT_LIMIT) : NO_RANGES
  } catch {
    return NO_RANGES
  }
}
const getRecentRanges = () => {
  const raw = localStorage.getItem(RECENT_KEY)

  if (raw !== cached.raw) {
    cached = { raw, ranges: parseRecent(raw) }
  }

  return cached.ranges
}
const subscribeToRecentRanges = (listener: () => void) => {
  listeners.add(listener)
  window.addEventListener("storage", listener)

  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}
const rememberRange = (range: Range) => {
  const next = [range, ...getRecentRanges().filter((entry) => !sameRange(entry, range))].slice(
    0,
    RECENT_LIMIT,
  )

  localStorage.setItem(RECENT_KEY, JSON.stringify(next))

  for (const listener of listeners) {
    listener()
  }
}
const useRecentRanges = () =>
  useSyncExternalStore(subscribeToRecentRanges, getRecentRanges, () => NO_RANGES)
const describeAny = (range: Range) =>
  describeRange(range.from, range.to) ??
  `${describeDateMath(range.from)} → ${describeDateMath(range.to)}`

type DateRangePickerProps = {
  from: string
  to: string
  refresh: RefreshInterval | undefined
  fetching: boolean
  onChange: (range: Range) => void
  onRefreshChange: (refresh: RefreshInterval | undefined) => void
  onRefresh: () => void
}

export function DateRangePicker({
  from,
  to,
  refresh,
  fetching,
  onChange,
  onRefreshChange,
  onRefresh,
}: DateRangePickerProps) {
  const [showDates, setShowDates] = useState(false)
  const recent = useRecentRanges()
  const pretty = describeRange(from, to)
  const apply = (range: Range) => {
    rememberRange(range)
    onChange(range)
  }

  return (
    <div sx={styles.root}>
      <div sx={styles.group}>
        <QuickMenu
          from={from}
          onApply={(range) => {
            setShowDates(false)
            apply(range)
          }}
          onRefreshChange={onRefreshChange}
          recent={recent}
          refresh={refresh}
          to={to}
        />
        {pretty !== null && !showDates ? (
          <button
            onClick={() => {
              setShowDates(true)
            }}
            sx={[styles.segment, styles.rangeSegment, styles.last]}
            type="button"
          >
            <span sx={styles.rangeText}>
              {pretty}
              <span sx={styles.showDates}>{m.activity_show_dates()}</span>
            </span>
          </button>
        ) : (
          <>
            <DatePopover
              edge="start"
              onApply={(value) => {
                apply({ from: value, to })
              }}
              value={from}
            />
            <ArrowRight {...stylex.props(styles.arrow)} size={16} />
            <DatePopover
              edge="end"
              onApply={(value) => {
                apply({ from, to: value })
              }}
              value={to}
            />
          </>
        )}
      </div>
      <Button aria-label={m.activity_refresh()} onClick={onRefresh} size="lg" sx={styles.refresh}>
        {fetching ? <Spinner {...stylex.props(styles.spin)} /> : <Refresh />}
        <span sx={styles.refreshLabel}>{m.activity_refresh()}</span>
      </Button>
    </div>
  )
}

function QuickMenu({
  from,
  to,
  recent,
  refresh,
  onApply,
  onRefreshChange,
}: {
  from: string
  to: string
  recent: readonly Range[]
  refresh: RefreshInterval | undefined
  onApply: (range: Range) => void
  onRefreshChange: (refresh: RefreshInterval | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const current = parseDateMath(from)
  const initial =
    current?.kind === "relative" && current.amount < 0 && to === "now"
      ? { amount: -current.amount, unit: current.unit }
      : { amount: 15, unit: "m" as const }
  const [direction, setDirection] = useState<"last" | "next">("last")
  const [amount, setAmount] = useState(initial.amount)
  const [unit, setUnit] = useState<DateMathUnit>(initial.unit)
  const [refreshValue, setRefreshValue] = useState<RefreshInterval>(refresh ?? "30s")
  const choose = (range: Range) => {
    setOpen(false)
    onApply(range)
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger aria-label={m.activity_quick_menu()} sx={[styles.segment, styles.quick]}>
        <CalendarIcon size={18} />
        <ChevronDown size={14} />
      </PopoverTrigger>
      <PopoverPopup align="start">
        <div sx={styles.menu}>
          <section sx={styles.section}>
            <p sx={styles.sectionTitle}>{m.activity_quick_select()}</p>
            <div sx={styles.quickRow}>
              <Select
                items={[
                  { value: "last", label: m.activity_last() },
                  { value: "next", label: m.activity_next() },
                ]}
                onValueChange={(value) => {
                  if (value === "last" || value === "next") {
                    setDirection(value)
                  }
                }}
                value={direction}
              >
                <SelectTrigger aria-label={m.activity_direction()} sx={styles.fit}>
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  <SelectItem value="last">{m.activity_last()}</SelectItem>
                  <SelectItem value="next">{m.activity_next()}</SelectItem>
                </SelectPopup>
              </Select>
              <NumberField
                aria-label={m.activity_amount()}
                min={1}
                onValueChange={(value) => {
                  setAmount(value === null ? 1 : Math.max(1, Math.round(value)))
                }}
                value={amount}
              >
                <NumberFieldGroup>
                  <NumberFieldInput />
                </NumberFieldGroup>
              </NumberField>
              <Select
                items={QUICK_UNITS.map((value) => ({ value, label: unitName(value) }))}
                onValueChange={(value) => {
                  const next = QUICK_UNITS.find((candidate) => candidate === value)

                  if (next !== undefined) {
                    setUnit(next)
                  }
                }}
                value={unit}
              >
                <SelectTrigger aria-label={m.activity_unit()} sx={styles.fit}>
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {QUICK_UNITS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {unitName(value)}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
              <Button
                onClick={() => {
                  choose(
                    direction === "last"
                      ? { from: `now-${amount}${unit}`, to: "now" }
                      : { from: "now", to: `now+${amount}${unit}` },
                  )
                }}
                variant="secondary"
              >
                {m.activity_apply()}
              </Button>
            </div>
          </section>
          <section sx={styles.section}>
            <p sx={styles.sectionTitle}>{m.activity_commonly_used()}</p>
            <div sx={styles.common}>
              {COMMON_RANGES.map((range) => (
                <button
                  key={`${range.from}-${range.to}`}
                  onClick={() => {
                    choose(range)
                  }}
                  sx={[styles.link, sameRange(range, { from, to }) && styles.linkActive]}
                  type="button"
                >
                  {describeAny(range)}
                </button>
              ))}
            </div>
          </section>
          <section sx={styles.section}>
            <p sx={styles.sectionTitle}>{m.activity_recently_used()}</p>
            {recent.length === 0 ? (
              <p sx={styles.empty}>{m.activity_recently_used_empty()}</p>
            ) : (
              <div sx={styles.section}>
                {recent.map((range) => (
                  <button
                    key={`${range.from}-${range.to}`}
                    onClick={() => {
                      choose(range)
                    }}
                    sx={styles.link}
                    type="button"
                  >
                    {describeAny(range)}
                  </button>
                ))}
              </div>
            )}
          </section>
          <section sx={styles.section}>
            <p sx={styles.sectionTitle}>{m.activity_refresh_every()}</p>
            <div sx={styles.refreshRow}>
              <Switch
                aria-label={m.activity_auto_refresh()}
                checked={refresh !== undefined}
                onCheckedChange={(checked) => {
                  onRefreshChange(checked ? refreshValue : undefined)
                }}
              />
              <Select
                items={REFRESH_INTERVALS.map((value) => ({ value, label: describeRefresh(value) }))}
                onValueChange={(value) => {
                  const next = REFRESH_INTERVALS.find((candidate) => candidate === value)

                  if (next !== undefined) {
                    setRefreshValue(next)

                    if (refresh !== undefined) {
                      onRefreshChange(next)
                    }
                  }
                }}
                value={refreshValue}
              >
                <SelectTrigger aria-label={m.activity_refresh_interval()}>
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {REFRESH_INTERVALS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {describeRefresh(value)}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </div>
          </section>
        </div>
      </PopoverPopup>
    </Popover>
  )
}

const REFRESH_DURATIONS: Record<RefreshInterval, [number, DateMathUnit]> = {
  "5s": [5, "s"],
  "10s": [10, "s"],
  "30s": [30, "s"],
  "1m": [1, "m"],
  "5m": [5, "m"],
  "15m": [15, "m"],
  "1h": [1, "h"],
}
const describeRefresh = (interval: RefreshInterval) =>
  formatDuration(...REFRESH_DURATIONS[interval])
const RELATIVE_OPTIONS = DATE_MATH_UNITS.flatMap((unit) => [
  { value: `${unit}-`, unit, sign: -1 },
  { value: `${unit}+`, unit, sign: 1 },
])
const relativeLabel = (unit: DateMathUnit, sign: number) =>
  sign < 0
    ? m.activity_unit_ago({ unit: unitName(unit) })
    : m.activity_unit_from_now({ unit: unitName(unit) })
const pad = (value: number) => String(value).padStart(2, "0")
const toTimeValue = (date: Date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
const getInitialTab = (parsed: ReturnType<typeof parseDateMath>, value: string) => {
  if (parsed?.kind === "absolute") {
    return "absolute"
  }

  return value === "now" ? "now" : "relative"
}

function DatePopover({
  value,
  edge,
  onApply,
}: {
  value: string
  edge: "start" | "end"
  onApply: (value: string) => void
}) {
  const parsed = parseDateMath(value)
  const now = useNow()
  const resolved = resolveDateMath(value, { now, roundUp: edge === "end" }) ?? new Date(now)
  const [tab, setTab] = useState<string>(parsed?.kind === "absolute" ? "absolute" : "relative")
  const [text, setText] = useState(formatDateTime(resolved))
  const relative =
    parsed?.kind === "relative"
      ? parsed
      : { kind: "relative" as const, amount: -15, unit: "m" as const, round: null }
  const applyDate = (date: Date) => {
    setText(formatDateTime(date))
    onApply(date.toISOString())
  }

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) {
          setTab(getInitialTab(parsed, value))
          setText(formatDateTime(resolved))
        }
      }}
    >
      <PopoverTrigger
        aria-label={edge === "start" ? m.activity_start_date() : m.activity_end_date()}
        sx={[styles.segment, styles.edge, edge === "end" && styles.last]}
      >
        {describeDateMath(value)}
      </PopoverTrigger>
      <PopoverPopup align={edge === "start" ? "start" : "end"}>
        <div sx={styles.datePopup}>
          <Tabs
            onValueChange={(next) => {
              setTab(String(next))
            }}
            value={tab}
          >
            <TabsList>
              <TabsTab value="absolute">{m.activity_absolute()}</TabsTab>
              <TabsTab value="relative">{m.activity_relative()}</TabsTab>
              <TabsTab value="now">{m.activity_now()}</TabsTab>
            </TabsList>
            <TabsPanel value="absolute">
              <div sx={styles.panel}>
                <Calendar
                  defaultMonth={resolved}
                  mode="single"
                  onSelect={(day) => {
                    if (day !== undefined) {
                      const next = new Date(day)

                      next.setHours(
                        resolved.getHours(),
                        resolved.getMinutes(),
                        resolved.getSeconds(),
                        0,
                      )
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
                      setText(event.currentTarget.value)
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
                    value={toTimeValue(resolved)}
                  />
                </div>
              </div>
            </TabsPanel>
            <TabsPanel value="relative">
              <div sx={styles.panel}>
                <div sx={styles.relativeRow}>
                  <NumberField
                    aria-label={m.activity_amount()}
                    min={0}
                    onValueChange={(next) => {
                      const amount = Math.max(0, Math.round(next ?? 0))

                      onApply(
                        toDateMath({
                          amount: amount * (relative.amount > 0 ? 1 : -1),
                          unit: relative.unit,
                          round: relative.round,
                        }),
                      )
                    }}
                    value={Math.abs(relative.amount)}
                  >
                    <NumberFieldGroup>
                      <NumberFieldDecrement />
                      <NumberFieldInput />
                      <NumberFieldIncrement />
                    </NumberFieldGroup>
                  </NumberField>
                  <Select
                    items={RELATIVE_OPTIONS.map((option) => ({
                      value: option.value,
                      label: relativeLabel(option.unit, option.sign),
                    }))}
                    onValueChange={(next) => {
                      const option = RELATIVE_OPTIONS.find((candidate) => candidate.value === next)

                      if (option !== undefined) {
                        onApply(
                          toDateMath({
                            amount: Math.abs(relative.amount) * option.sign,
                            unit: option.unit,
                            round: relative.round === null ? null : option.unit,
                          }),
                        )
                      }
                    }}
                    value={`${relative.unit}${relative.amount > 0 ? "+" : "-"}`}
                  >
                    <SelectTrigger aria-label={m.activity_unit()}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      {RELATIVE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {relativeLabel(option.unit, option.sign)}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                </div>
                <label sx={styles.toggle}>
                  <Switch
                    checked={relative.round !== null}
                    onCheckedChange={(checked) => {
                      onApply(
                        toDateMath({
                          amount: relative.amount,
                          unit: relative.unit,
                          round: checked ? relative.unit : null,
                        }),
                      )
                    }}
                  />
                  {m.activity_round_to({ unit: unitSingular(relative.unit) })}
                </label>
                <div sx={styles.preview}>{formatDateTime(resolved)}</div>
              </div>
            </TabsPanel>
            <TabsPanel value="now">
              <div sx={styles.panel}>
                <p sx={styles.nowText}>
                  {edge === "start" ? m.activity_now_start_help() : m.activity_now_end_help()}
                </p>
                <Button
                  onClick={() => {
                    onApply("now")
                  }}
                  variant="secondary"
                >
                  {edge === "start" ? m.activity_set_start_now() : m.activity_set_end_now()}
                </Button>
              </div>
            </TabsPanel>
          </Tabs>
        </div>
      </PopoverPopup>
    </Popover>
  )
}

import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { CaretDown, CaretUp } from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { formatPercent } from "@/components/dashboard/overview/format"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  delta: {
    gap: "0.25rem",
    alignItems: "center",
    display: "inline-flex",
    fontSize: "0.8125rem",
    fontWeight: 600,
    lineHeight: "1.25rem",
  },
  up: {
    color: colors.successForeground,
  },
  down: {
    color: colors.destructiveForeground,
  },
  flat: {
    color: colors.mutedForeground,
  },
  caret: {
    height: "0.625rem",
    width: "0.625rem",
  },
})
const getTrend = (value: number) => {
  const percent = formatPercent(Math.abs(value), 1)

  if (value > 0) {
    return { label: m.dashboard_delta_up({ percent }), tone: styles.up, Caret: CaretUp }
  }

  if (value < 0) {
    return { label: m.dashboard_delta_down({ percent }), tone: styles.down, Caret: CaretDown }
  }

  return { label: m.dashboard_delta_flat(), tone: styles.flat, Caret: null }
}

export function Delta({ value, sx }: { value: number | null; sx?: Sx }) {
  if (value === null) {
    return null
  }

  const { label, tone, Caret } = getTrend(value)

  return (
    <span aria-label={label} sx={[styles.delta, tone, sx]}>
      {Caret === null ? null : <Caret {...stylex.props(styles.caret)} />}
      <span aria-hidden>{formatPercent(Math.abs(value), 1)}</span>
    </span>
  )
}

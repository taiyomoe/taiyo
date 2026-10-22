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

export function Delta({ value, sx }: { value: number | null; sx?: Sx }) {
  if (value === null) {
    return null
  }

  const percent = formatPercent(Math.abs(value), 1)
  let label = m.dashboard_delta_flat()
  let tone = styles.flat
  let Caret: typeof CaretUp | null = null

  if (value > 0) {
    label = m.dashboard_delta_up({ percent })
    tone = styles.up
    Caret = CaretUp
  } else if (value < 0) {
    label = m.dashboard_delta_down({ percent })
    tone = styles.down
    Caret = CaretDown
  }

  return (
    <span aria-label={label} sx={[styles.delta, tone, sx]}>
      {Caret === null ? null : <Caret {...stylex.props(styles.caret)} />}
      <span aria-hidden>{percent}</span>
    </span>
  )
}

import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

export const OUTCOMES = ["success", "failure", "denied"] as const

export const OUTCOME_TONES: Record<(typeof OUTCOMES)[number], string> = {
  success: colors.chart2,
  failure: colors.warning,
  denied: colors.destructive,
}

export const OUTCOME_LABELS: Record<(typeof OUTCOMES)[number], () => string> = {
  success: m.activity_outcome_success,
  failure: m.activity_outcome_failure,
  denied: m.activity_outcome_denied,
}

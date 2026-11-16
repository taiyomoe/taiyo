export type TapeSide = "left" | "right"

export type TapePlacement = "falling" | "rising" | "upper" | "lower"

export const LOCKDOWN_TAPES = [
  { placement: "falling", side: "left", delay: 250, duration: 520 },
  { placement: "rising", side: "right", delay: 700, duration: 520 },
  { placement: "upper", side: "left", delay: 1120, duration: 460 },
  { placement: "lower", side: "right", delay: 1480, duration: 460 },
] as const satisfies ReadonlyArray<{
  placement: TapePlacement
  side: TapeSide
  delay: number
  duration: number
}>

export const LOCKDOWN_PLACARD = { delay: 2050, duration: 560, impact: 0.6 } as const

export const LOCKDOWN_IMPACT =
  LOCKDOWN_PLACARD.delay + LOCKDOWN_PLACARD.duration * LOCKDOWN_PLACARD.impact

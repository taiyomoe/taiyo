export type TapeSide = "left" | "right"

export type TapePlacement = "falling" | "rising" | "upper" | "lower"

// Each strip unrolls for exactly as long as the pull in its recording lasts,
// so the tape lands on the smack at the end of it.
export const LOCKDOWN_TAPES = [
  { placement: "falling", side: "left", delay: 250, duration: 490, sound: "tape-1" },
  { placement: "rising", side: "right", delay: 720, duration: 570, sound: "tape-2" },
  { placement: "upper", side: "left", delay: 1200, duration: 500, sound: "tape-3" },
  { placement: "lower", side: "right", delay: 1580, duration: 390, sound: "tape-4" },
] as const satisfies ReadonlyArray<{
  placement: TapePlacement
  side: TapeSide
  delay: number
  duration: number
  sound: string
}>

export const LOCKDOWN_PLACARD = { delay: 2100, duration: 560, impact: 0.6 } as const

export const LOCKDOWN_IMPACT =
  LOCKDOWN_PLACARD.delay + LOCKDOWN_PLACARD.duration * LOCKDOWN_PLACARD.impact

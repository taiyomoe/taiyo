import type { ClickZones, ReaderDirection } from "@/features/reader/lib/reader-settings"

export type ReaderStep = "prev" | "next"

export const getSideStep = (side: "left" | "right", direction: ReaderDirection): ReaderStep =>
  (side === "left") === (direction === "ltr") ? "prev" : "next"

export const getZoneAction = (
  ratio: number,
  zones: ClickZones,
  direction: ReaderDirection,
): ReaderStep | "menu" | null => {
  if (zones === "off") {
    return null
  }

  if (zones === "thirds" && ratio > 1 / 3 && ratio < 2 / 3) {
    return "menu"
  }

  return getSideStep(ratio < 0.5 ? "left" : "right", direction)
}

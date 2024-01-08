import type { Selection } from "@nextui-org/react"

const getSelectedKey = <T = string>(selection: Selection) =>
  (selection as Set<Selection>).values().next().value as T

export const SelectUtils = {
  getSelectedKey,
}

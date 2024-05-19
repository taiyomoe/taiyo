import type { Selection } from "@nextui-org/react"

const getSelectedKey = <T extends string>(selection: Selection) =>
  (selection as Set<Selection>).values().next().value as T

const enumToArray = <T extends string>(obj: Record<T, unknown>): T[] =>
  Object.keys(obj).map((key) => key as T)

const arrayToItems = <T extends string>(arr: T[]) =>
  arr.map((item) => ({ label: item, value: item }))

const enumToItems = <T extends string>(obj: Record<T, unknown>) =>
  arrayToItems(enumToArray(obj))

export const SelectUtils = {
  getSelectedKey,
  enumToItems,
}

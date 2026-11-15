import { useSyncExternalStore } from "react"

const subscribe = () => () => {}
const getServerValue = () => null

export const useClientValue = <T>(getValue: () => T) =>
  useSyncExternalStore(subscribe, getValue, getServerValue)

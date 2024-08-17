import type { Selection } from "@nextui-org/react"
import type { ScansList } from "@taiyomoe/types"
import { atom } from "jotai"

export const scansListInitialDataAtom = atom<{
  scans: ScansList
  totalPages: number
}>({ scans: [], totalPages: 0 })

export const scansListVisibleColumnsAtom = atom<Selection>(
  new Set(["name", "chapters", "members", "actions"]),
)

export const scansListLoadingAtom = atom(false)

export const scansListSelectedKeysAtom = atom<Selection>(new Set([]))

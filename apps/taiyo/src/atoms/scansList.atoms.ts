import type { Selection } from "@nextui-org/react"
import type { ScansList } from "@taiyomoe/types"
import { atom } from "jotai"

export const scansListInitialItemsAtom = atom<ScansList>([])

export const scansListVisibleColumnsAtom = atom<Selection>(
  new Set(["name", "chapters", "members", "actions"]),
)

export const scansListLoadingAtom = atom(false)

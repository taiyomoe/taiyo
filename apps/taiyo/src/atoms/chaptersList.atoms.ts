import type { Selection } from "@nextui-org/react"
import type { ChaptersListItem } from "@taiyomoe/types"
import { atom } from "jotai"

export const chaptersListInitialDataAtom = atom<{
  chapters: ChaptersListItem[]
  totalPages: number
}>({ chapters: [], totalPages: 0 })

export const chaptersListVisibleColumnsAtom = atom<Selection>(
  new Set([
    "createdAt",
    "title",
    "number",
    "volume",
    "language",
    "uploader",
    "scans",
    "media",
    "actions",
  ]),
)

export const chaptersListLoadingAtom = atom(false)

export const chaptersListSelectedKeysAtom = atom<Selection>(new Set([]))

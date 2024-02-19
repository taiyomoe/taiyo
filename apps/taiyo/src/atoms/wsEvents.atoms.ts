import type { ImportEventMessage } from "@taiyomoe/types"
import { atom } from "jotai"

export const importEventMessages = atom<ImportEventMessage[]>([])

import type { ImportMediaEventMessage } from "@taiyomoe/types"
import { atom } from "jotai"

export const importMediaEventMessagesAtom = atom<ImportMediaEventMessage[]>([])

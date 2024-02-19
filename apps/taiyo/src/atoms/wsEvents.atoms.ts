import { atom } from "jotai"

import type { ImportEventMessage } from "@taiyomoe/types"

export const importEventMessages = atom<ImportEventMessage[]>([])

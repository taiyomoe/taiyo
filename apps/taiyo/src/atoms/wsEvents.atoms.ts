import { atom } from "jotai"

import type { ImportEventMessage } from "~/lib/types"

export const importEventMessages = atom<ImportEventMessage[]>([])

import type { ImportMediaEventMessage } from "@taiyomoe/types"
import { atom } from "jotai"

export const importMediaCurrentStepAtom = atom(0)
export const importMediaMessagesAtom = atom<
  Record<number, Pick<ImportMediaEventMessage, "content" | "type">[]>
>({})

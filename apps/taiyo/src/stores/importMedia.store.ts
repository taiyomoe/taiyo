import type { ImportMediaEventMessage } from "@taiyomoe/types"
import { create } from "zustand"

type s = {
  currentStep: number
  downloadChapters: boolean
  messages: ImportMediaEventMessage[]
  error: string | null
}

type Actions = {
  set: (state: Partial<s>) => void
  addMessage: (message: ImportMediaEventMessage) => void
}

export const useImportMediaStore = create<s & Actions>((set) => ({
  currentStep: 0,
  downloadChapters: true,
  messages: [],
  error: null,

  set: (state) => set(state),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
}))

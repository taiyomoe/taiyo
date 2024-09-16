import type { GenericMessage } from "@taiyomoe/types"
import { create } from "zustand"

type s = {
  currentStep: number
  downloadCovers: boolean
  downloadChapters: boolean
  messages: GenericMessage[]
  error: string | null
}

type Actions = {
  set: (state: Partial<s>) => void
  addMessage: (message: GenericMessage) => void
}

export const useSyncMediaStore = create<s & Actions>((set) => ({
  currentStep: 0,
  downloadCovers: true,
  downloadChapters: true,
  messages: [],
  error: null,

  set: (state) => set(state),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
}))

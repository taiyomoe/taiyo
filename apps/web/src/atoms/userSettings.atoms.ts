import { atom } from "jotai"

export const userSettingsSelectedTabAtom = atom<
  "profile" | "language" | "blocks" | "sessions"
>("profile")

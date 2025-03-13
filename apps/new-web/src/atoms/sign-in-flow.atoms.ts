import { atom } from "jotai"

export const signInFlowStepAtom = atom<
  "socials" | "email" | "username" | "verification"
>("socials")

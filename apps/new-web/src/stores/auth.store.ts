import { create } from "zustand"

const steps = [
  "socials",
  "magicLink",
  "email",
  "username",
  "verificationEmailSent",
  "forgotPassword",
  "magicLinkSent",
] as const

type State = {
  page: number
  direction: -1 | 1

  goToSocials: () => void
  goToStep: (step: (typeof steps)[number]) => void
}

export const useAuthStore = create<State>((set) => ({
  page: 0,
  direction: -1,

  goToSocials: () => set({ page: 0, direction: -1 }),
  goToStep: (step) =>
    set((prev) => ({
      page: steps.indexOf(step),
      direction: steps.indexOf(step) > prev.page ? 1 : -1,
    })),
}))

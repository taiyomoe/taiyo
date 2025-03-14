import { create } from "zustand"

const steps = [
  "socials",
  "email",
  "username",
  "verification-email-sent",
  "forgot-password",
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
    set((prev) => {
      const newPageIndex = steps.indexOf(step)

      console.log(`Navigated to ${step} (${newPageIndex})`)

      return {
        page: newPageIndex,
        direction: newPageIndex > prev.page ? 1 : -1,
      }
    }),
}))

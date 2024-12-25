import { atom } from "jotai"

export const bulkEditChaptersActiveTabAtom = atom<"volumes" | "scans">(
  "volumes",
)

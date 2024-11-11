import type { UploadChapterState } from "@taiyomoe/types"
import { atom } from "jotai"

export const bulkUploadChaptersStateAtoms = atom<
  Record<number, UploadChapterState>
>({})

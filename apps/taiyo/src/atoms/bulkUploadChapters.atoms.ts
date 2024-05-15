import type { UploadChapterState } from "@taiyomoe/image-orchestrator"
import { atom } from "jotai"

export const bulkUploadChaptersStateAtoms = atom<
  Record<number, UploadChapterState>
>({})

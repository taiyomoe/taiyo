import { ImageFolder } from "@taiyomoe/types"
import { create } from "zustand"
import { ImageUtils } from "~/lib/utils/image.utils"

type ImageFolderStore = {
  folders: ImageFolder[]

  compressing: number[]
  uploading: number[]
  uploaded: number[]

  // getImages: (type: UploadSessionType) => File[]
  compress: (chapterNumber: number) => Promise<File[]>

  load: (folders: ImageFolder[]) => void
  toggleStatus: (
    chapterNumber: number,
    status: "compressing" | "uploading" | "uploaded",
  ) => void
  reset: () => void
}

export const useImageFolderStore = create<ImageFolderStore>((set, get) => ({
  folders: [],

  compressing: [],
  uploading: [],
  uploaded: [],

  compress: async (chapterNumber) => {
    get().toggleStatus(chapterNumber, "compressing")

    const [_, rawFiles] = get().folders.find((f) => f[0] === chapterNumber)!
    const files = await Promise.all(rawFiles.map(ImageUtils.convert))
    ImageUtils.sortByFileName(files)

    set((state) => ({
      compressing: state.compressing.filter((n) => n !== chapterNumber),
      folders: state.folders.map((f) => {
        if (f[0] === chapterNumber) {
          return [chapterNumber, files]
        }

        return f
      }),
    }))

    return files
  },

  load: (folders) => {
    set({ folders })
  },
  toggleStatus: (chapterNumber, status) => {
    set((state) => ({
      [status]: state[status].includes(chapterNumber)
        ? state[status].filter((n) => n !== chapterNumber)
        : [...state[status], chapterNumber],
    }))
  },
  reset: () => {
    set(() => ({ folders: [], compressing: [] }))
  },
}))

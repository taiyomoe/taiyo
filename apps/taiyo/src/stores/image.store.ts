import type { UploadSessionType } from "@prisma/client"
import { create } from "zustand"
import { ImageUtils } from "~/lib/utils/image.utils"

export type ImageStore = {
  images: { [key in UploadSessionType]: File[] }

  isCompressing: boolean

  getImages: (type: UploadSessionType) => File[]
  load: (type: UploadSessionType, rawFiles: File[]) => Promise<void>
  reset: (type: UploadSessionType) => void
}

export const useImageStore = create<ImageStore>((set, get) => ({
  images: {
    COVER: [],
    BANNER: [],
    CHAPTER: [],
  },

  isCompressing: false,

  getImages: (type) => {
    return get().images[type]
  },
  load: async (type, rawFiles) => {
    set({ isCompressing: true })

    const files = await Promise.all(rawFiles.map(ImageUtils.convert))
    ImageUtils.sortByFileName(files)

    set((prev) => ({
      images: {
        ...prev.images,
        [type]: files,
      },
      isCompressing: false,
    }))
  },
  reset: (type) => {
    set((prev) => ({ images: { ...prev.images, [type]: [] } }))
  },
}))

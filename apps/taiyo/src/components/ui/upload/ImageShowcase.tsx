import type { UploadSessionType } from "@prisma/client"
import { useImageStore } from "~/stores"

import { ImageCard } from "./ImageCard"

type Props = { type: UploadSessionType }

export const ImageShowcase = ({ type }: Props) => {
  const { getImages } = useImageStore()
  const selectedImages = getImages(type)

  return (
    <div className="flex flex-col gap-2">
      {selectedImages.map((file, i) => (
        <ImageCard
          key={file.name}
          file={file}
          position={`${i + 1}/${selectedImages.length}`}
        />
      ))}
    </div>
  )
}

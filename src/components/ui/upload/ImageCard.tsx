import { tv } from "@nextui-org/react"
import prettyBytes from "pretty-bytes"

type Props = {
  file: File
  position: string
}

const imageCard = tv({
  slots: {
    container: "relative flex max-w-full rounded-medium bg-default-200",
    imagePreview:
      "h-[150px] w-[100px] rounded-l-medium object-cover md:w-[150px]",
    contentContainer: "flex grow flex-col gap-2 p-2",
    upperContentContainer: "flex justify-between gap-2",
    lowerContentContainer: "flex grow flex-col justify-end gap-1",
    fileNameText: "line-clamp-1 h-fit text-ellipsis",
    filePositionText: "px-2",
    fileSizeText: "w-fit rounded-lg px-2 py-1",
    fileTypeText: "w-fit rounded-lg px-2 py-1",
  },
  variants: {
    isJpeg: {
      true: {
        fileTypeText: "bg-success-200",
      },
      false: {
        fileTypeText: "bg-danger-200",
      },
    },
  },
})

export const ImageCard = ({ file, position }: Props) => {
  const slots = imageCard({ isJpeg: file.type === "image/jpeg" })

  return (
    <div className={slots.container()}>
      <img
        className={slots.imagePreview()}
        src={URL.createObjectURL(file)}
        alt="uploaded media preview"
      />
      <div className={slots.contentContainer()}>
        <div className={slots.upperContentContainer()}>
          <p className={slots.fileNameText()}>{file.name}</p>
          <p className={slots.filePositionText()}>{position}</p>
        </div>
        <div className={slots.lowerContentContainer()}>
          <p className={slots.fileSizeText()}>
            Tamanho: {prettyBytes(file.size)}
          </p>
          <p className={slots.fileTypeText()}>Extensão: {file.type}</p>
        </div>
      </div>
    </div>
  )
}

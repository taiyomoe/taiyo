import { extname } from "path"

const convert = async (source: File) => {
  const image = await createImageBitmap(source)

  const canvas = document.createElement("canvas")
  canvas.width = image.width
  canvas.height = image.height

  const context = canvas.getContext("2d")!
  context.drawImage(image, 0, 0)

  const result: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob != null) {
          resolve(blob)
        } else {
          reject(new Error("Failed to convert file"))
        }
      },
      "image/jpeg",
      0.85,
    )
  })

  image.close()

  return new File([result], source.name.replace(extname(source.name), ".jpg"), {
    lastModified: Date.now(),
    type: "image/jpeg",
  })
}

const sortByFileName = (files: File[]) => {
  return files.sort((a, b) => a.name.charCodeAt(0) - b.name.charCodeAt(0))
}

export const ImageUtils = {
  convert,
  sortByFileName,
}

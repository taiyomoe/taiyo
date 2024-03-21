import sharp from "sharp"

const compress = async (file: File | Blob, extension: string) => {
  const buffer = new Uint8Array(await file.arrayBuffer())

  if (extension === "gif") {
    return buffer
  }

  return await sharp(buffer).jpeg({ progressive: true, quality: 85 }).toBuffer()
}

export const ImagesService = {
  compress,
}

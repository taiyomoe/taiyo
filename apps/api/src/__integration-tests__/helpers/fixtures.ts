import sharp from "sharp"

const cache = new Map<string, Buffer>()
const getPng = async (size: number) => {
  const cached = cache.get(`png:${size}`)

  if (cached) {
    return cached
  }

  const buf = await sharp({
    create: { width: size, height: size, channels: 3, background: { r: 200, g: 80, b: 80 } },
  })
    .png()
    .toBuffer()

  cache.set(`png:${size}`, buf)

  return buf
}

export const tinyPng = async (name = "tiny.png"): Promise<File> => {
  const buf = await getPng(2)

  return new File([new Uint8Array(buf)], name, { type: "image/png" })
}

export const invalidImage = (name = "fake.png"): File => {
  return new File([new Uint8Array([0xff, 0xfe, 0xfd, 0xfc])], name, { type: "image/png" })
}

// A JPEG with an EXIF block. checkImages must strip the metadata and
// transcode — the resulting object in S3 must report no EXIF.
export const jpegWithExif = async (name = "with-exif.jpg"): Promise<File> => {
  const cached = cache.get("jpeg-exif")
  const buf =
    cached ??
    (await sharp({
      create: { width: 4, height: 4, channels: 3, background: { r: 30, g: 30, b: 200 } },
    })
      .withExif({
        IFD0: { Copyright: "advisor-test", Make: "TestCam", Model: "TestModel" },
      })
      .jpeg()
      .toBuffer())

  cache.set("jpeg-exif", buf)

  return new File([new Uint8Array(buf)], name, { type: "image/jpeg" })
}

// export const oversizedImage = async (name = "huge.png"): Promise<File> => {
//   const buf = await getPng(4096)

//   return new File([new Uint8Array(buf)], name, { type: "image/png" })
// }

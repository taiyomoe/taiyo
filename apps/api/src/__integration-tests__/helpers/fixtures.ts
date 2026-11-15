import sharp from "sharp"

const cache = new Map<string, Buffer>()

export const tinyPng = async (name = "tiny.png"): Promise<File> => {
  const buf =
    cache.get("png") ??
    (await sharp({
      create: { width: 2, height: 2, channels: 3, background: { r: 200, g: 80, b: 80 } },
    })
      .png()
      .toBuffer())

  cache.set("png", buf)

  return new File([new Uint8Array(buf)], name, { type: "image/png" })
}

export const tinyGif = async (name = "tiny.gif"): Promise<File> => {
  const cached = cache.get("gif")
  const buf =
    cached ??
    (await sharp({
      create: { width: 2, height: 2, channels: 3, background: { r: 80, g: 200, b: 120 } },
    })
      .gif()
      .toBuffer())

  cache.set("gif", buf)

  return new File([new Uint8Array(buf)], name, { type: "image/gif" })
}

export const invalidImage = (name = "fake.png"): File =>
  new File([new Uint8Array([0xff, 0xfe, 0xfd, 0xfc])], name, { type: "image/png" })

export const fakeImageOfSize = (bytes: number, name = "sized.jpg"): File =>
  new File([new Uint8Array(bytes)], name, { type: "image/jpeg" })

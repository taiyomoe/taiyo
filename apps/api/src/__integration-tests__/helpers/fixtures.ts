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

export const oversizedImage = async (name = "huge.png"): Promise<File> => {
  const buf = await getPng(4096)

  return new File([new Uint8Array(buf)], name, { type: "image/png" })
}

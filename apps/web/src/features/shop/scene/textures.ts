import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three"

const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement("canvas")

  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")

  if (context === null) {
    throw new Error("2D canvas is unavailable")
  }

  return { canvas, context }
}
const toTexture = (canvas: HTMLCanvasElement, srgb: boolean) => {
  const texture = new CanvasTexture(canvas)

  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.anisotropy = 8

  if (srgb) {
    texture.colorSpace = SRGBColorSpace
  }

  return texture
}
const seeded = (seed: number) => {
  let state = seed

  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296

    return state / 4_294_967_296
  }
}

export const createBrushedTexture = (seed = 7) => {
  const { canvas, context } = createCanvas(512, 512)
  const random = seeded(seed)

  context.fillStyle = "rgb(140 140 140)"
  context.fillRect(0, 0, 512, 512)

  for (let line = 0; line < 2600; line += 1) {
    const y = random() * 512
    const shade = 90 + random() * 120

    context.strokeStyle = `rgb(${shade} ${shade} ${shade} / ${0.08 + random() * 0.18})`
    context.lineWidth = 0.5 + random() * 1.4
    context.beginPath()
    context.moveTo(random() * -200, y)
    context.lineTo(512 + random() * 200, y + (random() - 0.5) * 2)
    context.stroke()
  }

  for (let speck = 0; speck < 900; speck += 1) {
    const shade = random() * 255

    context.fillStyle = `rgb(${shade} ${shade} ${shade} / 0.12)`
    context.fillRect(random() * 512, random() * 512, 1 + random() * 2, 1 + random() * 2)
  }

  return toTexture(canvas, false)
}

export const createWoodTexture = (dark: string, light: string, seed = 3) => {
  const { canvas, context } = createCanvas(1024, 512)
  const random = seeded(seed)
  const planks = 5

  for (let plank = 0; plank < planks; plank += 1) {
    const top = (512 / planks) * plank
    const gradient = context.createLinearGradient(0, top, 0, top + 512 / planks)

    gradient.addColorStop(0, light)
    gradient.addColorStop(0.5 + (random() - 0.5) * 0.3, dark)
    gradient.addColorStop(1, light)
    context.fillStyle = gradient
    context.fillRect(0, top, 1024, 512 / planks)

    for (let grain = 0; grain < 90; grain += 1) {
      const y = top + random() * (512 / planks)
      const amplitude = 1 + random() * 4
      const frequency = 0.004 + random() * 0.01
      const phase = random() * Math.PI * 2

      context.strokeStyle = `rgb(0 0 0 / ${0.05 + random() * 0.12})`
      context.lineWidth = 0.6 + random() * 1.6
      context.beginPath()

      for (let x = 0; x <= 1024; x += 16) {
        const offset = Math.sin(x * frequency + phase) * amplitude

        if (x === 0) {
          context.moveTo(x, y + offset)
        } else {
          context.lineTo(x, y + offset)
        }
      }

      context.stroke()
    }

    context.fillStyle = "rgb(0 0 0 / 0.55)"
    context.fillRect(0, top, 1024, 2.5)
  }

  return toTexture(canvas, true)
}

export const createFacetTexture = (seed = 11) => {
  const { canvas, context } = createCanvas(512, 512)
  const random = seeded(seed)

  context.fillStyle = "rgb(30 30 30)"
  context.fillRect(0, 0, 512, 512)

  for (let shard = 0; shard < 70; shard += 1) {
    const x = random() * 512
    const y = random() * 512
    const size = 40 + random() * 120
    const shade = 30 + random() * 160

    context.fillStyle = `rgb(${shade} ${shade} ${shade} / 0.5)`
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + size * (random() - 0.2), y + size * (random() - 0.5))
    context.lineTo(x + size * (random() - 0.5), y + size * (random() - 0.2))
    context.closePath()
    context.fill()
  }

  return toTexture(canvas, false)
}

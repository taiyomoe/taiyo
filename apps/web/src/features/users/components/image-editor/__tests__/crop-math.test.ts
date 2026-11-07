import { describe, expect, it } from "vitest"
import {
  clampPan,
  clampTransform,
  getFrameSize,
  getImageCrop,
  getMinScale,
  getRotatedBounds,
  normalizeRotation,
  rotatePoint,
  zoomAround,
} from "../crop-math"

const square = { width: 100, height: 100 }
const banner = { width: 300, height: 100 }
const photo = { width: 4000, height: 3000 }
/** Every frame corner, mapped into the image's own pixel grid (origin at its centre). */
const frameCornersInImage = (
  transform: { panX: number; panY: number; scale: number; rotation: number },
  frame: { width: number; height: number },
) =>
  [
    { x: -frame.width / 2, y: -frame.height / 2 },
    { x: frame.width / 2, y: -frame.height / 2 },
    { x: frame.width / 2, y: frame.height / 2 },
    { x: -frame.width / 2, y: frame.height / 2 },
  ].map((corner) => {
    const local = rotatePoint(
      { x: corner.x - transform.panX, y: corner.y - transform.panY },
      -transform.rotation,
    )

    return { x: local.x / transform.scale, y: local.y / transform.scale }
  })
const cornersOutside = (
  transform: { panX: number; panY: number; scale: number; rotation: number },
  image: { width: number; height: number },
  frame: { width: number; height: number },
) =>
  frameCornersInImage(transform, frame).filter(
    (corner) =>
      Math.abs(corner.x) > image.width / 2 + 1e-6 || Math.abs(corner.y) > image.height / 2 + 1e-6,
  )
/** Clamps a spread of far-off pans, at several zoom levels, for both frame shapes. */
const getClampedCases = (rotation: number) => {
  const cases = []

  for (const frame of [square, banner]) {
    const minScale = getMinScale(photo, frame, rotation)

    for (const scale of [minScale, minScale * 1.3, minScale * 4]) {
      for (const wanted of [
        { x: 0, y: 0 },
        { x: 5000, y: 0 },
        { x: -3000, y: 2000 },
        { x: 400, y: -900 },
      ]) {
        const pan = clampPan(wanted, { scale, rotation }, photo, frame)

        cases.push({ transform: { panX: pan.x, panY: pan.y, scale, rotation }, frame })
      }
    }
  }

  return cases
}

describe("getRotatedBounds", () => {
  it("swaps the sides at 90° and grows at 45°", () => {
    const quarter = getRotatedBounds(photo, 90)
    const diagonal = getRotatedBounds(square, 45)

    expect(quarter.width).toBeCloseTo(3000)
    expect(quarter.height).toBeCloseTo(4000)
    expect(diagonal.width).toBeCloseTo(100 * Math.SQRT2)
    expect(diagonal.height).toBeCloseTo(100 * Math.SQRT2)
  })
})

describe("getMinScale", () => {
  it("fits the short side when unrotated", () => {
    expect(getMinScale(photo, square, 0)).toBeCloseTo(100 / 3000)
    expect(getMinScale(photo, banner, 0)).toBeCloseTo(300 / 4000)
  })

  it("uses the frame's rotated extent: max(ex / W, ey / H)", () => {
    const degrees = 30
    const radians = (degrees * Math.PI) / 180
    const ex = Math.abs(300 * Math.cos(radians)) + Math.abs(100 * Math.sin(radians))
    const ey = Math.abs(300 * Math.sin(radians)) + Math.abs(100 * Math.cos(radians))

    expect(getMinScale(photo, banner, degrees)).toBeCloseTo(Math.max(ex / 4000, ey / 3000))
  })

  it("needs more zoom for a banner once the photo is turned on its side", () => {
    expect(getMinScale(photo, banner, 90)).toBeCloseTo(300 / 3000)
  })
})

describe("clampPan", () => {
  it("leaves a pan that already covers the frame alone", () => {
    expect(clampPan({ x: 10, y: -5 }, { scale: 0.1, rotation: 0 }, photo, square)).toEqual({
      x: 10,
      y: -5,
    })
  })

  it("stops an unrotated image at its edges", () => {
    const pan = clampPan({ x: 1000, y: -1000 }, { scale: 0.1, rotation: 0 }, photo, square)

    expect(pan.x).toBeCloseTo(150)
    expect(pan.y).toBeCloseTo(-100)
  })

  it.each([0, 7, 30, 45, -12.5, 90, 135, -170])(
    "keeps all four frame corners inside the image at %d°",
    (rotation) => {
      const outside = getClampedCases(rotation).flatMap(({ transform, frame }) =>
        cornersOutside(transform, photo, frame),
      )

      expect(outside).toEqual([])
    },
  )

  it("moves a rotated pan only as far as it must", () => {
    const transform = clampTransform(
      { panX: 2000, panY: 2000, scale: 1, rotation: 20, flipX: false, flipY: false },
      photo,
      banner,
    )
    const nudged = clampPan(
      { x: transform.panX * 0.5, y: transform.panY * 0.5 },
      transform,
      photo,
      banner,
    )

    expect(nudged.x).toBeCloseTo(transform.panX * 0.5)
    expect(nudged.y).toBeCloseTo(transform.panY * 0.5)
  })
})

describe("clampTransform", () => {
  it("raises the scale to cover the frame and caps it at the maximum zoom", () => {
    const base = { panX: 0, panY: 0, rotation: 0, flipX: false, flipY: false }

    expect(clampTransform({ ...base, scale: 0.001 }, photo, square).scale).toBeCloseTo(100 / 3000)
    expect(clampTransform({ ...base, scale: 100 }, photo, square).scale).toBeCloseTo(
      (100 / 3000) * 8,
    )
  })
})

describe("getImageCrop", () => {
  const base = { flipX: false, flipY: false }

  it("takes the centred square of an unrotated photo at fit", () => {
    const crop = getImageCrop(
      { ...base, panX: 0, panY: 0, scale: 100 / 3000, rotation: 0 },
      photo,
      square,
    )

    expect(crop.x).toBeCloseTo(500 / 4000)
    expect(crop.y).toBeCloseTo(0)
    expect(crop.width).toBeCloseTo(3000 / 4000)
    expect(crop.height).toBeCloseTo(1)
    expect(crop.rotation).toBe(0)
  })

  it("follows the pan: moving the image right reveals its left side", () => {
    const scale = 100 / 3000
    const crop = getImageCrop({ ...base, panX: 500 * scale, panY: 0, scale, rotation: 0 }, photo, {
      width: 100,
      height: 100,
    })

    expect(crop.x).toBeCloseTo(0)
    expect(crop.width).toBeCloseTo(0.75)
  })

  it("measures a 90° crop on the rotated bounding box", () => {
    const scale = getMinScale(photo, banner, 90)
    const crop = getImageCrop({ ...base, panX: 0, panY: 100, scale, rotation: 90 }, photo, banner)

    // Rotated, the photo is 3000 × 4000 and the frame covers 3000 × 1000 of it.
    expect(crop.x).toBeCloseTo(0)
    expect(crop.width).toBeCloseTo(1)
    expect(crop.height).toBeCloseTo(1000 / 4000)
    expect(crop.y).toBeCloseTo((2000 - 100 / scale - 500) / 4000)
    expect(crop.rotation).toBe(90)
  })

  it("passes flips through and normalises the rotation", () => {
    const crop = getImageCrop(
      { panX: 0, panY: 0, scale: 0.1, rotation: 270, flipX: true, flipY: false },
      photo,
      square,
    )

    expect(crop.rotation).toBe(-90)
    expect(crop.flipX).toBe(true)
  })
})

describe("helpers", () => {
  it("normalises rotations into [−180, 180)", () => {
    expect(normalizeRotation(0)).toBe(0)
    expect(normalizeRotation(-90)).toBe(-90)
    expect(normalizeRotation(450)).toBe(90)
    expect(normalizeRotation(180)).toBe(-180)
    expect(normalizeRotation(-360)).toBe(0)
  })

  it("keeps the focal point fixed when zooming", () => {
    const pan = { x: 20, y: -10 }
    const focal = { x: 50, y: 40 }
    const next = zoomAround(pan, 1, 2, focal)

    // The image point under the focal point, before and after.
    expect((focal.x - pan.x) / 1).toBeCloseTo((focal.x - next.x) / 2)
    expect((focal.y - pan.y) / 1).toBeCloseTo((focal.y - next.y) / 2)
  })

  it("fits the frame inside the viewport with a margin", () => {
    expect(getFrameSize({ width: 400, height: 300 }, 1, 20)).toEqual({ width: 260, height: 260 })
    expect(getFrameSize({ width: 400, height: 300 }, 3, 20)).toEqual({ width: 360, height: 120 })
  })
})

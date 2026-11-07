export type Size = { width: number; height: number }

export type Point = { x: number; y: number }

export type ImageEditorKind = "avatar" | "banner"

/**
 * What the server needs to reproduce the editor: flip, then rotate clockwise
 * (expanding the canvas to the rotated bounding box), then extract this
 * rectangle, given as fractions of that bounding box.
 */
export type ImageCrop = {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  flipX: boolean
  flipY: boolean
}

/**
 * How the image sits in the editor. The image (natural size W × H) is drawn
 * centred in the viewport at `translate(panX, panY) rotate(rotation)
 * scale(scale · ±1)`, and the crop frame is centred in the viewport too, so
 * `panX`/`panY` are the offset between the image centre and the frame centre,
 * in viewport pixels. `scale` is viewport pixels per image pixel.
 */
export type CropTransform = {
  panX: number
  panY: number
  scale: number
  rotation: number
  flipX: boolean
  flipY: boolean
}

export const EDITOR_KINDS = {
  avatar: { aspect: 1, output: { width: 512, height: 512 } },
  banner: { aspect: 3, output: { width: 1800, height: 600 } },
} as const satisfies Record<ImageEditorKind, { aspect: number; output: Size }>

/**
 * Where the avatar sits over the banner on the profile page, as fractions of
 * the banner height: its diameter, its left inset, and how much of it overlaps
 * the banner (half its diameter). The editor draws it as a hint and the preview mocks it.
 */
export const AVATAR_OVER_BANNER = { diameter: 0.47, inset: 0.18, overlap: 0.235 } as const

export const MAX_ZOOM = 8

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

/** Rotates a point clockwise (y points down, as on screen) around the origin. */
export const rotatePoint = ({ x, y }: Point, degrees: number) => {
  const radians = toRadians(degrees)
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)

  return { x: x * cos - y * sin, y: x * sin + y * cos } satisfies Point
}

/** The axis-aligned box a W × H rectangle occupies once rotated. */
export const getRotatedBounds = ({ width, height }: Size, degrees: number) => {
  const radians = toRadians(degrees)
  const cos = Math.abs(Math.cos(radians))
  const sin = Math.abs(Math.sin(radians))

  return { width: width * cos + height * sin, height: width * sin + height * cos } satisfies Size
}

/**
 * The smallest scale at which the image, rotated by `degrees`, still covers
 * the whole frame: the frame's own bounding box in the image's frame of
 * reference has to fit inside the image.
 */
export const getMinScale = (image: Size, frame: Size, degrees: number) => {
  const extent = getRotatedBounds(frame, degrees)

  return Math.max(extent.width / image.width, extent.height / image.height)
}

/**
 * Moves the image as little as possible so that no corner of the frame falls
 * outside it. In the image's own (unrotated) frame of reference, the frame's
 * corners d_i must satisfy |d_i − u| ≤ scale · size / 2 on both axes, where u
 * is the pan rotated back by −θ. That is a box for u, which is clamped and
 * rotated forward again.
 */
export const clampPan = (
  pan: Point,
  { scale, rotation }: Pick<CropTransform, "rotation" | "scale">,
  image: Size,
  frame: Size,
) => {
  const corners = [
    { x: -frame.width / 2, y: -frame.height / 2 },
    { x: frame.width / 2, y: -frame.height / 2 },
    { x: frame.width / 2, y: frame.height / 2 },
    { x: -frame.width / 2, y: frame.height / 2 },
  ].map((corner) => rotatePoint(corner, -rotation))
  const local = rotatePoint(pan, -rotation)
  const halfWidth = (scale * image.width) / 2
  const halfHeight = (scale * image.height) / 2
  const clampAxis = (value: number, axis: "x" | "y", half: number) => {
    const min = Math.max(...corners.map((corner) => corner[axis])) - half
    const max = Math.min(...corners.map((corner) => corner[axis])) + half

    // Below the minimum scale the box is empty; centring is the closest fit.
    return min > max ? (min + max) / 2 : clamp(value, min, max)
  }

  return rotatePoint(
    { x: clampAxis(local.x, "x", halfWidth), y: clampAxis(local.y, "y", halfHeight) },
    rotation,
  )
}

/** Clamps the scale to [cover, MAX_ZOOM × cover], then the pan to cover the frame. */
export const clampTransform = <T extends CropTransform>(transform: T, image: Size, frame: Size) => {
  const minScale = getMinScale(image, frame, transform.rotation)
  const scale = clamp(transform.scale, minScale, minScale * MAX_ZOOM)
  const pan = clampPan(
    { x: transform.panX, y: transform.panY },
    { scale, rotation: transform.rotation },
    image,
    frame,
  )

  return { ...transform, scale, panX: pan.x, panY: pan.y } satisfies T
}

/**
 * Scales around a focal point (relative to the viewport centre) so the image
 * pixel under it stays put.
 */
export const zoomAround = (pan: Point, scale: number, nextScale: number, focal: Point) => {
  const ratio = nextScale / scale

  return { x: focal.x - (focal.x - pan.x) * ratio, y: focal.y - (focal.y - pan.y) * ratio }
}

/** The largest frame of the given aspect that fits the viewport with a margin. */
export const getFrameSize = (viewport: Size, aspect: number, margin: number) => {
  const width = Math.max(
    Math.min(viewport.width - margin * 2, (viewport.height - margin * 2) * aspect),
    0,
  )

  return { width, height: width / aspect } satisfies Size
}

/** Maps any angle to [−180, 180), the range the server accepts. */
export const normalizeRotation = (degrees: number) => {
  const normalized = ((((degrees + 180) % 360) + 360) % 360) - 180

  return Math.round(normalized * 1000) / 1000 + 0
}

/**
 * The crop as the server reads it: in the rotated bounding box (W′ × H′), the
 * frame's top-left is (W′/2 − panX/s − cw/2s, H′/2 − panY/s − ch/2s) and its
 * size is (cw/s, ch/s). Flips do not appear: they happen before the rotation
 * on both sides and leave the bounding box where it is.
 */
export const getImageCrop = (transform: CropTransform, image: Size, frame: Size) => {
  const rotation = normalizeRotation(transform.rotation)
  const bounds = getRotatedBounds(image, rotation)
  const { scale } = transform
  const left = bounds.width / 2 - transform.panX / scale - frame.width / (2 * scale)
  const top = bounds.height / 2 - transform.panY / scale - frame.height / (2 * scale)
  const x = clamp(left / bounds.width, 0, 1)
  const y = clamp(top / bounds.height, 0, 1)

  return {
    x,
    y,
    width: clamp(frame.width / scale / bounds.width, Number.EPSILON, 1 - x),
    height: clamp(frame.height / scale / bounds.height, Number.EPSILON, 1 - y),
    rotation,
    flipX: transform.flipX,
    flipY: transform.flipY,
  } satisfies ImageCrop
}

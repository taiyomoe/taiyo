export type Zoom = { scale: number; x: number; y: number }

type Point = { x: number; y: number }

type Size = { width: number; height: number }

export const NO_ZOOM: Zoom = { scale: 1, x: 0, y: 0 }

export const TAP_ZOOM = 2.5

const MAX_ZOOM = 5
const MIN_ZOOM = 1.02

export const clampZoom = ({ scale, x, y }: Zoom, { width, height }: Size) => {
  if (scale < MIN_ZOOM) {
    return NO_ZOOM
  }

  const clamped = Math.min(scale, MAX_ZOOM)

  return {
    scale: clamped,
    x: Math.min(0, Math.max(width - width * clamped, x)),
    y: Math.min(0, Math.max(height - height * clamped, y)),
  } satisfies Zoom
}

export const zoomAround = (start: Zoom, from: Point, to: Point, scale: number, size: Size) => {
  const contentX = (from.x - start.x) / start.scale
  const contentY = (from.y - start.y) / start.scale

  return clampZoom({ scale, x: to.x - contentX * scale, y: to.y - contentY * scale }, size)
}

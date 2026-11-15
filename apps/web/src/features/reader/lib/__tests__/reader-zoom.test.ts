import { describe, expect, it } from "vitest"
import { NO_ZOOM, clampZoom, zoomAround } from "../reader-zoom"

const size = { width: 400, height: 800 }

describe("clampZoom", () => {
  it("snaps back to no zoom at or below 1x", () => {
    expect(clampZoom({ scale: 0.6, x: 30, y: 30 }, size)).toEqual(NO_ZOOM)
    expect(clampZoom({ scale: 1.01, x: -2, y: -2 }, size)).toEqual(NO_ZOOM)
  })

  it("caps the scale at 5x", () => {
    expect(clampZoom({ scale: 9, x: 0, y: 0 }, size).scale).toBe(5)
  })

  it("keeps the page covering the stage", () => {
    expect(clampZoom({ scale: 2, x: 50, y: -2000 }, size)).toEqual({ scale: 2, x: 0, y: -800 })
  })
})

describe("zoomAround", () => {
  it("keeps the point under the fingers in place", () => {
    const point = { x: 100, y: 200 }
    const zoom = zoomAround(NO_ZOOM, point, point, 2, size)

    expect(zoom).toEqual({ scale: 2, x: -100, y: -200 })
    expect((point.x - zoom.x) / zoom.scale).toBe(100)
  })

  it("follows the fingers when they move while pinching", () => {
    const zoom = zoomAround(NO_ZOOM, { x: 100, y: 200 }, { x: 80, y: 150 }, 2, size)

    expect(zoom).toEqual({ scale: 2, x: -120, y: -250 })
  })

  it("zooms out around a point of an already zoomed page", () => {
    const start = { scale: 4, x: -600, y: -1200 }
    const point = { x: 200, y: 400 }
    const zoom = zoomAround(start, point, point, 2, size)

    expect(zoom).toEqual({ scale: 2, x: -200, y: -400 })
  })
})

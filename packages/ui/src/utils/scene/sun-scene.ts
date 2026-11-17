import { BEAMS_FRAGMENT, PLANE_VERTEX, PLASMA_FRAGMENT, SPHERE_VERTEX } from "./shaders"
import {
  axisAngle,
  createMesh,
  createProgram,
  IDENTITY,
  modelView,
  multiply,
  perspective,
  planeGeometry,
  rotation,
  sphereGeometry,
} from "./webgl"

const FOV = 30
const CAMERA_Z = 12
const VISIBLE_HEIGHT = 2 * CAMERA_Z * Math.tan(((FOV / 2) * Math.PI) / 180)
const BEAM_EXTENT = 3
const BREATH_SECONDS = 5
const AUTO_SPIN = 0.05
const MAX_FLING = 3
const INTERACTIVE = "a, button, input, textarea, select, label, [role='button']"

export type SunScene = ReturnType<typeof createSunScene>

/**
 * Draws the plasma sun and its beams on `canvas`, over the box of `anchor`:
 * the page lays the sun out in CSS and this scene follows that box every frame.
 * Dragging the sun anywhere on `surface` spins it.
 */
export const createSunScene = ({
  canvas,
  anchor,
  surface,
  reducedMotion,
  onReady,
}: {
  canvas: HTMLCanvasElement
  anchor: HTMLElement
  surface: HTMLElement
  reducedMotion: boolean
  onReady: () => void
}) => {
  const gl = canvas.getContext("webgl2", { antialias: true, alpha: true, stencil: false })

  if (gl === null) {
    throw new Error("WebGL2 is unavailable")
  }

  const pixelRatio = Math.min(window.devicePixelRatio, 1.75)
  const uniforms = { uTime: 0, uBreath: 0, uExtent: BEAM_EXTENT, uSize: 1 }
  const plasmaProgram = createProgram(gl, SPHERE_VERTEX, PLASMA_FRAGMENT)
  const beamProgram = createProgram(gl, PLANE_VERTEX, BEAMS_FRAGMENT)
  const sphere = createMesh(gl, plasmaProgram, sphereGeometry(96, 64))
  const plane = createMesh(gl, beamProgram, planeGeometry())
  const group = { x: 0, y: 0, scale: 1 }
  let projection = perspective(FOV, 1, 0.1, 100)
  let spin = axisAngle(0, 0, 1, 0.12)
  const drag = { pointer: -1, x: 0, y: 0, time: 0, velocityX: 0, velocityY: 0, held: 0, radius: 1 }
  let disc = { x: 0, y: 0, radius: 0 }
  let layoutKey = ""
  let breathPhase = 0
  let visible = true
  let frame = 0
  let ready = false
  let lastTimestamp: number | null = null
  const setUniforms = (program: WebGLProgram, values: Record<string, number>) => {
    for (const [name, value] of Object.entries(values)) {
      gl.uniform1f(gl.getUniformLocation(program, name), value)
    }
  }
  // three.js's order and state: the opaque sphere first, then the beams blended behind it.
  const render = () => {
    const turned = rotation(spin)
    const translation: [number, number, number] = [group.x, group.y, -CAMERA_Z]

    gl.clearColor(0, 0, 0, 0)
    gl.depthMask(true)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.BACK)
    gl.disable(gl.BLEND)

    gl.useProgram(plasmaProgram)
    gl.uniformMatrix4fv(gl.getUniformLocation(plasmaProgram, "projectionMatrix"), false, projection)
    gl.uniformMatrix4fv(
      gl.getUniformLocation(plasmaProgram, "modelViewMatrix"),
      false,
      modelView(turned, group.scale, translation),
    )
    gl.uniformMatrix3fv(gl.getUniformLocation(plasmaProgram, "normalMatrix"), false, turned)
    setUniforms(plasmaProgram, { uTime: uniforms.uTime })
    sphere.draw()

    gl.enable(gl.BLEND)
    gl.blendEquation(gl.FUNC_ADD)
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.depthMask(false)
    gl.useProgram(beamProgram)
    gl.uniformMatrix4fv(gl.getUniformLocation(beamProgram, "projectionMatrix"), false, projection)
    gl.uniformMatrix4fv(
      gl.getUniformLocation(beamProgram, "modelViewMatrix"),
      false,
      modelView(IDENTITY, group.scale * BEAM_EXTENT * 2, translation),
    )
    setUniforms(beamProgram, uniforms)
    plane.draw()
  }
  const measure = () => {
    const canvasBox = canvas.getBoundingClientRect()
    const anchorBox = anchor.getBoundingClientRect()

    disc = {
      x: anchorBox.left + anchorBox.width / 2,
      y: anchorBox.top + anchorBox.height / 2,
      radius: anchorBox.width / 2,
    }

    return { canvasBox, x: disc.x - canvasBox.left, y: disc.y - canvasBox.top }
  }
  const layout = () => {
    const { canvasBox, x, y } = measure()
    const { width, height } = canvasBox
    const key = `${width}:${height}:${x}:${y}:${disc.radius}`

    if (width === 0 || height === 0) {
      return null
    }

    if (key === layoutKey) {
      return false
    }

    layoutKey = key
    canvas.width = Math.floor(width * pixelRatio)
    canvas.height = Math.floor(height * pixelRatio)
    gl.viewport(0, 0, Math.round(width * pixelRatio), Math.round(height * pixelRatio))
    projection = perspective(FOV, width / height, 0.1, 100)

    const unit = VISIBLE_HEIGHT / height

    group.x = (x - width / 2) * unit
    group.y = (height / 2 - y) * unit
    group.scale = disc.radius * unit
    uniforms.uSize = disc.radius / 235

    return true
  }
  const rotate = (dx: number, dy: number) => {
    const angle = Math.hypot(dx, dy) / drag.radius

    if (angle === 0) {
      return
    }

    spin = multiply(axisAngle(dy, dx, 0, angle), spin)
  }
  const onSun = (event: PointerEvent) =>
    Math.hypot(event.clientX - disc.x, event.clientY - disc.y) <= disc.radius * 1.03 &&
    !(event.target instanceof Element && event.target.closest(INTERACTIVE))
  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || !onSun(event)) {
      return
    }

    event.preventDefault()
    surface.setPointerCapture(event.pointerId)
    surface.style.cursor = "grabbing"
    Object.assign(drag, {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      time: event.timeStamp,
      velocityX: 0,
      velocityY: 0,
      held: 0,
      radius: disc.radius,
    })
  }
  const onPointerMove = (event: PointerEvent) => {
    if (drag.pointer !== event.pointerId) {
      surface.style.cursor = event.pointerType === "mouse" && onSun(event) ? "grab" : ""

      return
    }

    const dx = event.clientX - drag.x
    // Vertical swipes keep scrolling the page on touch screens.
    const dy = event.pointerType === "touch" ? 0 : event.clientY - drag.y
    const seconds = Math.max((event.timeStamp - drag.time) / 1000, 1 / 240)

    drag.x = event.clientX
    drag.y = event.clientY
    drag.time = event.timeStamp
    // Smoothed and capped, so one fast last event does not fling the sun around.
    const vx = drag.velocityX * 0.4 + (dx / seconds) * 0.6
    const vy = drag.velocityY * 0.4 + (dy / seconds) * 0.6
    const cap = Math.min(1, (drag.radius * MAX_FLING) / Math.max(Math.hypot(vx, vy), 1))

    drag.velocityX = vx * cap
    drag.velocityY = vy * cap
    drag.held = 0
    rotate(dx, dy)
  }
  const onPointerUp = (event: PointerEvent) => {
    if (drag.pointer !== event.pointerId) {
      return
    }

    drag.pointer = -1
    surface.style.cursor = onSun(event) ? "grab" : ""

    if (drag.held > 0.08 || reducedMotion) {
      drag.velocityX = 0
      drag.velocityY = 0
    }
  }
  const tick = (timestamp: number) => {
    frame = requestAnimationFrame(tick)

    const delta = Math.min(Math.max((timestamp - (lastTimestamp ?? timestamp)) / 1000, 0), 0.1)

    lastTimestamp = timestamp

    if (!visible || document.hidden) {
      return
    }

    const moved = layout()

    if (moved === null) {
      return
    }

    const dragging = drag.pointer !== -1
    const coasting = drag.velocityX ** 2 + drag.velocityY ** 2 > 1

    if (dragging) {
      drag.held += delta
    } else if (coasting) {
      rotate(drag.velocityX * delta, drag.velocityY * delta)
      drag.velocityX *= Math.exp(-delta * 3)
      drag.velocityY *= Math.exp(-delta * 3)
    }

    if (reducedMotion && ready && !moved && !dragging && !coasting) {
      return
    }

    if (!reducedMotion) {
      uniforms.uTime += delta
      breathPhase += delta / BREATH_SECONDS
      uniforms.uBreath = 0.5 - 0.5 * Math.cos(breathPhase * Math.PI * 2)

      if (!dragging && !coasting) {
        spin = multiply(axisAngle(0, 1, 0, delta * AUTO_SPIN), spin)
      }
    }

    render()

    if (!ready) {
      ready = true
      onReady()
    }
  }
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true
  })

  visibilityObserver.observe(canvas)
  surface.addEventListener("pointerdown", onPointerDown)
  surface.addEventListener("pointermove", onPointerMove)
  surface.addEventListener("pointerup", onPointerUp)
  surface.addEventListener("pointercancel", onPointerUp)
  frame = requestAnimationFrame(tick)

  return {
    dispose: () => {
      cancelAnimationFrame(frame)
      visibilityObserver.disconnect()
      surface.removeEventListener("pointerdown", onPointerDown)
      surface.removeEventListener("pointermove", onPointerMove)
      surface.removeEventListener("pointerup", onPointerUp)
      surface.removeEventListener("pointercancel", onPointerUp)
      surface.style.cursor = ""
      sphere.dispose()
      plane.dispose()
      gl.deleteProgram(plasmaProgram)
      gl.deleteProgram(beamProgram)
    },
  }
}

import {
  Group,
  MathUtils,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Timer,
  Vector3,
  WebGLRenderer,
} from "three"
import {
  BEAMS_FRAGMENT,
  PLANE_VERTEX,
  PLASMA_FRAGMENT,
  SPHERE_VERTEX,
} from "@/components/scene/sun/shaders"

const FOV = 30
const CAMERA_Z = 12
const VISIBLE_HEIGHT = 2 * CAMERA_Z * Math.tan(MathUtils.degToRad(FOV / 2))
const BEAM_EXTENT = 3
const BREATH_SECONDS = 5
const AUTO_SPIN = 0.05
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
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })

  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))

  const uniforms = { uTime: { value: 0 }, uBreath: { value: 0 } }
  const scene = new Scene()
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100)
  const group = new Group()
  const spin = new Group()
  const sphereGeometry = new SphereGeometry(1, 96, 64)
  const planeGeometry = new PlaneGeometry(1, 1)
  const plasma = new ShaderMaterial({
    uniforms,
    vertexShader: SPHERE_VERTEX,
    fragmentShader: PLASMA_FRAGMENT,
  })
  const beamUniforms = { ...uniforms, uExtent: { value: BEAM_EXTENT }, uSize: { value: 1 } }
  const beamMaterial = new ShaderMaterial({
    uniforms: beamUniforms,
    vertexShader: PLANE_VERTEX,
    fragmentShader: BEAMS_FRAGMENT,
    transparent: true,
    depthWrite: false,
  })
  const beams = new Mesh(planeGeometry, beamMaterial)
  const timer = new Timer()
  const turn = new Quaternion()
  const axis = new Vector3()
  const up = new Vector3(0, 1, 0)
  const drag = { pointer: -1, x: 0, y: 0, time: 0, velocityX: 0, velocityY: 0, held: 0, radius: 1 }
  const bounce = { x: 0, velocity: 0 }
  let disc = { x: 0, y: 0, radius: 0 }
  let layoutKey = ""
  let breathPhase = 0
  let visible = true
  let frame = 0
  let ready = false

  camera.position.z = CAMERA_Z
  spin.rotation.z = 0.12
  spin.add(new Mesh(sphereGeometry, plasma))
  beams.scale.setScalar(BEAM_EXTENT * 2)
  beams.renderOrder = -1
  group.add(spin, beams)
  scene.add(group)

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
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    const unit = VISIBLE_HEIGHT / height

    group.position.set((x - width / 2) * unit, (height / 2 - y) * unit, 0)
    group.scale.setScalar(disc.radius * unit)
    beamUniforms.uSize.value = disc.radius / 235

    return true
  }
  const rotate = (dx: number, dy: number) => {
    const angle = Math.hypot(dx, dy) / drag.radius

    if (angle === 0) {
      return
    }

    turn.setFromAxisAngle(axis.set(dy, dx, 0).normalize(), angle)
    spin.quaternion.premultiply(turn)
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
    drag.velocityX = dx / seconds
    drag.velocityY = dy / seconds
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
    timer.update(timestamp)

    const delta = Math.min(Math.max(timer.getDelta(), 0), 0.1)

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
      uniforms.uTime.value += delta
      breathPhase += delta / BREATH_SECONDS
      uniforms.uBreath.value = 0.5 - 0.5 * Math.cos(breathPhase * Math.PI * 2)

      // An underdamped spring chasing the breath: the sun bounces in at mid-inhale, out at mid-exhale.
      const goal = uniforms.uBreath.value > 0.5 ? 1 : 0

      for (let step = 0; step < 4; step += 1) {
        bounce.velocity += (-170 * (bounce.x - goal) - 9 * bounce.velocity) * (delta / 4)
        bounce.x += bounce.velocity * (delta / 4)
      }

      spin.scale.setScalar(1 + 0.015 * bounce.x)

      if (!dragging && !coasting) {
        spin.quaternion.premultiply(turn.setFromAxisAngle(up, delta * AUTO_SPIN))
      }
    }

    renderer.render(scene, camera)

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
      timer.dispose()
      sphereGeometry.dispose()
      planeGeometry.dispose()
      plasma.dispose()
      beamMaterial.dispose()
      renderer.dispose()
    },
  }
}

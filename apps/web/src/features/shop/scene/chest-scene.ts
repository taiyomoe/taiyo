import type { CosmeticRarity } from "@taiyomoe/db/cosmetics"
import type { LootBoxKey } from "@taiyomoe/db/loot-boxes"
import {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Timer,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"
import { RARITY_COLORS } from "@/features/shop/lib/rarity-colors"
import {
  CHEST_DEPTH,
  CHEST_HEIGHT,
  CHEST_WIDTH,
  type ChestModel,
  createChestModel,
} from "@/features/shop/scene/chest-model"
import { createBeams } from "@/features/shop/scene/effects/beams"
import { createParticleField } from "@/features/shop/scene/effects/particles"
import { createStage } from "@/features/shop/scene/effects/stage"

export type ChestSceneMode = "showcase" | "opening"

const BURST_PARTICLES: Record<CosmeticRarity, number> = {
  common: 140,
  rare: 240,
  epic: 380,
  legendary: 620,
}
const SHAKE: Record<CosmeticRarity, number> = {
  common: 0.02,
  rare: 0.035,
  epic: 0.06,
  legendary: 0.12,
}
const LID_OPEN = -1.85
const FRAMING = {
  showcase: { position: new Vector3(0, 2.8, 12.4), target: new Vector3(0, 0.75, 0) },
  charging: { position: new Vector3(0, 2.5, 11.5), target: new Vector3(0, 1.3, 0) },
  open: { position: new Vector3(0, 4, 17.5), target: new Vector3(0, 2.55, 0) },
}
const approach = (current: number, target: number, rate: number, delta: number) =>
  current + (target - current) * (1 - Math.exp(-rate * delta))

export type ChestScene = ReturnType<typeof createChestScene>

export const createChestScene = ({
  canvas,
  tier,
  mode,
  reducedMotion,
}: {
  canvas: HTMLCanvasElement
  tier: LootBoxKey
  mode: ChestSceneMode
  reducedMotion: boolean
}) => {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  })
  const pixelRatio = Math.min(window.devicePixelRatio, 1.75)

  renderer.setPixelRatio(pixelRatio)
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.92
  renderer.outputColorSpace = SRGBColorSpace

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  const camera = new PerspectiveCamera(26, 1, 0.1, 80)
  const composer = new EffectComposer(renderer)
  const bloom = new UnrealBloomPass(new Vector2(256, 256), 0.42, 0.55, 1.2)
  const stage = createStage("#060609")
  const beams = createBeams(CHEST_HEIGHT)
  const particles = createParticleField(1800, pixelRatio)
  const key = new DirectionalLight("#fff6e8", 1.7)
  const rim = new DirectionalLight("#ffffff", 2.6)
  const timer = new Timer()
  const lookTarget = new Vector3()
  const goalPosition = new Vector3()
  const goalTarget = new Vector3()
  let model: ChestModel = createChestModel(tier)
  let currentTier = tier
  let pendingTier: LootBoxKey | null = null
  let swap = 1
  let phase: "idle" | "charging" | "open" = "idle"
  let charge = 0
  let lidAngle = 0
  let lidVelocity = 0
  let shake = 0
  let bloomBoost = 0
  let innerGlow = 0
  let lightBoost = 0
  let moteTime = 0
  let moteColors: readonly string[] = []
  let sparkCarry = 0
  let visible = true
  let frame = 0

  scene.background = new Color("#060609")
  scene.environment = environment
  scene.environmentIntensity = 0.5
  scene.environmentRotation.set(0, Math.PI * 0.7, 0)
  key.position.set(3.5, 6, 4.5)
  rim.position.set(-4, 3.5, -5)
  rim.color.set(model.palette.glow)
  scene.add(
    key,
    rim,
    new HemisphereLight("#cbd5e1", "#050505", 0.35),
    stage.floor,
    model.root,
    beams.group,
    particles.points,
  )
  stage.setTint(model.palette.stage, 0.22)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(bloom)
  composer.addPass(new OutputPass())

  const framing = () => {
    if (mode === "showcase") {
      return FRAMING.showcase
    }

    return phase === "open" ? FRAMING.open : FRAMING.charging
  }
  const initial = framing()

  camera.position.copy(initial.position)
  lookTarget.copy(initial.target)

  const resize = () => {
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    if (width === 0 || height === 0) {
      return
    }

    renderer.setSize(width, height, false)
    composer.setSize(width, height)
    bloom.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  const resizeObserver = new ResizeObserver(resize)
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true
  })

  resizeObserver.observe(canvas)
  visibilityObserver.observe(canvas)
  resize()

  const emitSparks = (count: number) => {
    const side = Math.random() < 0.5 ? -1 : 1

    particles.emit({
      count,
      origin: [0, CHEST_HEIGHT + 0.02, (CHEST_DEPTH / 2) * (Math.random() < 0.7 ? 1 : -1)],
      spread: [CHEST_WIDTH * 0.9, 0.02, 0.05],
      direction: [side * 0.2, 1, 0.4],
      cone: 1.1,
      speed: [0.6, 2.2],
      size: [0.6, 1.4],
      life: [0.35, 0.8],
      colors: [model.palette.glow, "#ffffff"],
      gravity: -3,
      drag: 2.2,
    })
  }
  const tick = (timestamp: number) => {
    frame = requestAnimationFrame(tick)
    timer.update(timestamp)

    const delta = Math.min(Math.max(timer.getDelta(), 0), 1 / 20)
    const time = timer.getElapsed()

    if (!visible || document.hidden) {
      return
    }

    if (pendingTier !== null) {
      swap = Math.max(0, swap - delta * 6)

      if (swap === 0) {
        scene.remove(model.root)
        model.dispose()
        model = createChestModel(pendingTier)
        currentTier = pendingTier
        rim.color.set(model.palette.glow)
        stage.setTint(model.palette.stage, 0.22)
        scene.add(model.root)
        pendingTier = null
      }
    } else {
      swap = Math.min(1, swap + delta * 4)
    }

    const pop = swap < 1 ? 1 - (1 - swap) ** 3 : 1
    const overshoot = swap < 1 ? 1 + Math.sin(swap * Math.PI) * 0.08 : 1

    model.root.scale.setScalar(Math.max(0.001, pop * overshoot))

    const turntable = reducedMotion ? 0 : Math.sin(time * 0.35) * 0.32
    const bob = reducedMotion ? 0 : Math.sin(time * 1.1) * 0.035

    if (phase === "charging" && !reducedMotion) {
      const intensity = charge ** 1.6
      const jitter = Math.sin(time * 52) * Math.sin(time * 31)

      model.root.rotation.set(
        Math.sin(time * 47) * 0.02 * intensity,
        turntable * 0.3 + jitter * 0.05 * intensity,
        Math.sin(time * 61) * 0.045 * intensity,
      )
      model.root.position.set(
        jitter * 0.03 * intensity,
        Math.abs(Math.sin(time * 9)) * 0.07 * intensity,
        0,
      )
    } else {
      model.root.rotation.set(
        0,
        approach(model.root.rotation.y, phase === "open" ? 0 : turntable, 3, delta),
        0,
      )
      model.root.position.set(0, phase === "open" ? 0 : bob, 0)
    }

    const rattling = phase === "charging" && Math.sin(time * 17) > 0.55
    const lidTarget = phase === "open" ? LID_OPEN : Number(rattling) * (-0.025 - charge * 0.04)
    const stiffness = phase === "open" ? 70 : 260
    const damping = phase === "open" ? 7 : 22

    lidVelocity += ((lidTarget - lidAngle) * stiffness - lidVelocity * damping) * delta
    lidAngle += lidVelocity * delta
    model.lid.rotation.x = Math.max(LID_OPEN - 0.25, Math.min(0, lidAngle))

    const seamFlicker =
      phase === "charging" ? (0.25 + charge * 0.75) * (0.8 + Math.random() * 0.2) : 0

    model.seamMaterial.opacity = approach(model.seamMaterial.opacity, seamFlicker, 12, delta)
    innerGlow = approach(innerGlow, phase === "open" ? 0.7 : 0, 4, delta)
    model.innerMaterial.opacity = innerGlow
    lightBoost = approach(lightBoost, phase === "open" ? 1 : charge * 0.25, 3, delta)
    model.light.intensity = lightBoost * 5
    model.gemMaterial.emissiveIntensity =
      0.35 + charge * 1.8 + Math.max(0, Math.sin(time * 2.2)) * 0.25

    if (model.runeMaterial !== null) {
      model.runeMaterial.opacity = 0.55 + Math.sin(time * 2.4) * 0.3 + charge * 0.4
    }

    if (phase === "charging") {
      sparkCarry += delta * (8 + charge * 70)

      while (sparkCarry >= 1) {
        emitSparks(1)
        sparkCarry -= 1
      }
    }

    if (moteTime > 0) {
      moteTime -= delta
      particles.emit({
        count: 2,
        origin: [0, CHEST_HEIGHT + 0.2, 0],
        spread: [CHEST_WIDTH * 0.8, 0.2, CHEST_DEPTH * 0.6],
        direction: [0, 1, 0],
        cone: 0.35,
        speed: [0.4, 1.4],
        size: [0.5, 1.6],
        life: [1.4, 2.6],
        colors: moteColors,
        gravity: 0.25,
        drag: 0.6,
      })
    }

    particles.update(delta)
    beams.update(delta, time)
    stage.update(delta)
    bloomBoost = approach(bloomBoost, 0, 1.6, delta)
    bloom.strength = 0.42 + bloomBoost

    const goal = framing()

    goalPosition.copy(goal.position)
    goalTarget.copy(goal.target)

    if (camera.aspect < 1) {
      goalPosition.multiplyScalar(1 + (1 - camera.aspect) * 0.9)
    }

    const cameraRate = (phase === "open" ? 1.6 : 2.4) * (reducedMotion ? 8 : 1)

    camera.position.lerp(goalPosition, 1 - Math.exp(-cameraRate * delta))
    lookTarget.lerp(goalTarget, 1 - Math.exp(-cameraRate * delta))
    shake = approach(shake, 0, 2.6, delta)

    if (!reducedMotion && (shake > 0.001 || phase === "charging")) {
      const amount = shake + (phase === "charging" ? charge ** 2 * 0.012 : 0)

      camera.position.x += Math.sin(time * 83) * amount
      camera.position.y += Math.sin(time * 71 + 1.3) * amount
    }

    camera.lookAt(lookTarget)
    composer.render(delta)
  }

  frame = requestAnimationFrame(tick)

  return {
    setTier: (next: LootBoxKey) => {
      pendingTier = next === currentTier ? null : next
    },
    setCharge: (value: number) => {
      phase = "charging"
      charge = value
      stage.setTint(model.palette.stage, 0.2 + value * 0.22)
    },
    burst: (rarity: CosmeticRarity) => {
      const palette = RARITY_COLORS[rarity]
      const colors = [palette.main, palette.light, palette.main, palette.light, "#ffffff"]
      const count = BURST_PARTICLES[rarity] * (reducedMotion ? 0.3 : 1)

      phase = "open"
      charge = 0
      lidVelocity = -16
      shake = reducedMotion ? 0 : SHAKE[rarity]
      bloomBoost = rarity === "legendary" ? 0.8 : 0.4
      moteTime = rarity === "legendary" ? 6 : 3.5
      moteColors = colors
      model.light.color.set(palette.main)
      model.innerMaterial.color.set(palette.light).multiplyScalar(1.4)
      rim.color.set(palette.main)
      stage.setTint(palette.main, 0.5)
      beams.ignite(palette.main)
      particles.emit({
        count,
        origin: [0, CHEST_HEIGHT + 0.15, 0],
        spread: [CHEST_WIDTH * 0.7, 0.1, CHEST_DEPTH * 0.5],
        direction: [0, 1, 0],
        cone: 0.95,
        speed: [3, 9.5],
        size: [0.45, 1.5],
        life: [0.9, 2],
        colors,
        gravity: -4.5,
        drag: 1.2,
      })
      particles.emit({
        count: Math.round(count * 0.4),
        origin: [0, CHEST_HEIGHT + 0.1, 0],
        spread: [0.6, 0.05, 0.4],
        direction: [0, 0.2, 0],
        cone: Math.PI / 2,
        speed: [2.5, 6],
        size: [0.5, 1.3],
        life: [0.6, 1.2],
        colors,
        gravity: -1,
        drag: 2.6,
      })
    },
    reset: () => {
      phase = "idle"
      charge = 0
      moteTime = 0
      particles.clear()
      beams.reset()
      model.light.color.set(model.palette.glow)
      model.innerMaterial.color.set(model.palette.glow).multiplyScalar(1.6)
      rim.color.set(model.palette.glow)
      stage.setTint(model.palette.stage, 0.22)
    },
    dispose: () => {
      cancelAnimationFrame(frame)
      timer.dispose()
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      model.dispose()
      particles.dispose()
      beams.dispose()
      stage.dispose()
      environment.dispose()
      pmrem.dispose()
      bloom.dispose()
      composer.dispose()
      renderer.dispose()
    },
  }
}

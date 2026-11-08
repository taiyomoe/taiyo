import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
} from "three"

const VERTEX = `
attribute float aSize;
attribute float aAlpha;
attribute vec3 aColor;
uniform float uPixelRatio;
varying float vAlpha;
varying vec3 vColor;

void main() {
  vColor = aColor;
  vAlpha = aAlpha;
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uPixelRatio * (220.0 / -viewPosition.z);
  gl_Position = projectionMatrix * viewPosition;
}
`
const FRAGMENT = `
varying float vAlpha;
varying vec3 vColor;

void main() {
  float distanceToCenter = length(gl_PointCoord - 0.5);
  float core = smoothstep(0.5, 0.0, distanceToCenter);
  float glow = core * core;
  gl_FragColor = vec4(vColor * (0.8 + glow * 2.4), glow * vAlpha);
}
`

export type EmitOptions = {
  count: number
  origin: [number, number, number]
  spread: [number, number, number]
  direction: [number, number, number]
  cone: number
  speed: [number, number]
  size: [number, number]
  life: [number, number]
  colors: readonly string[]
  gravity?: number
  drag?: number
}

const between = ([min, max]: [number, number]) => min + Math.random() * (max - min)

export type ParticleField = ReturnType<typeof createParticleField>

export const createParticleField = (capacity: number, pixelRatio: number) => {
  const positions = new Float32Array(capacity * 3)
  const colors = new Float32Array(capacity * 3)
  const sizes = new Float32Array(capacity)
  const alphas = new Float32Array(capacity)
  const velocities = new Float32Array(capacity * 3)
  const ages = new Float32Array(capacity).fill(1)
  const lives = new Float32Array(capacity).fill(1)
  const baseSizes = new Float32Array(capacity)
  const gravities = new Float32Array(capacity)
  const drags = new Float32Array(capacity)
  const geometry = new BufferGeometry()
  const scratch = new Color()
  let cursor = 0

  geometry.setAttribute("position", new BufferAttribute(positions, 3))
  geometry.setAttribute("aColor", new BufferAttribute(colors, 3))
  geometry.setAttribute("aSize", new BufferAttribute(sizes, 1))
  geometry.setAttribute("aAlpha", new BufferAttribute(alphas, 1))

  const material = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms: { uPixelRatio: { value: pixelRatio } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const points = new Points(geometry, material)

  points.frustumCulled = false

  return {
    points,
    emit: (options: EmitOptions) => {
      const [dx, dy, dz] = options.direction

      for (let index = 0; index < options.count; index += 1) {
        const slot = cursor
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * options.cone
        const speed = between(options.speed)
        const sx = Math.sin(phi) * Math.cos(theta)
        const sz = Math.sin(phi) * Math.sin(theta)
        const sy = Math.cos(phi)

        cursor = (cursor + 1) % capacity
        positions[slot * 3] = options.origin[0] + (Math.random() - 0.5) * options.spread[0]
        positions[slot * 3 + 1] = options.origin[1] + (Math.random() - 0.5) * options.spread[1]
        positions[slot * 3 + 2] = options.origin[2] + (Math.random() - 0.5) * options.spread[2]
        velocities[slot * 3] = (sx + dx * 0.4) * speed
        velocities[slot * 3 + 1] = (sy * dy + Math.abs(dy) * 0.2) * speed
        velocities[slot * 3 + 2] = (sz + dz * 0.4) * speed
        scratch.set(options.colors[index % options.colors.length] ?? "#ffffff")
        colors[slot * 3] = scratch.r
        colors[slot * 3 + 1] = scratch.g
        colors[slot * 3 + 2] = scratch.b
        baseSizes[slot] = between(options.size)
        lives[slot] = between(options.life)
        ages[slot] = 0
        gravities[slot] = options.gravity ?? -2.4
        drags[slot] = options.drag ?? 1.4
      }
    },
    update: (delta: number) => {
      for (let slot = 0; slot < capacity; slot += 1) {
        const life = lives[slot] ?? 1
        const age = (ages[slot] ?? 1) + delta / life

        ages[slot] = age

        if (age >= 1) {
          alphas[slot] = 0

          continue
        }

        const damping = Math.exp(-(drags[slot] ?? 0) * delta)
        const vx = (velocities[slot * 3] ?? 0) * damping
        const vy = ((velocities[slot * 3 + 1] ?? 0) + (gravities[slot] ?? 0) * delta) * damping
        const vz = (velocities[slot * 3 + 2] ?? 0) * damping

        velocities[slot * 3] = vx
        velocities[slot * 3 + 1] = vy
        velocities[slot * 3 + 2] = vz
        positions[slot * 3] = (positions[slot * 3] ?? 0) + vx * delta
        positions[slot * 3 + 1] = (positions[slot * 3 + 1] ?? 0) + vy * delta
        positions[slot * 3 + 2] = (positions[slot * 3 + 2] ?? 0) + vz * delta
        alphas[slot] = Math.min(1, age * 12) * (1 - age) ** 1.4
        sizes[slot] = (baseSizes[slot] ?? 0) * (1 - age * 0.55)
      }

      for (const name of ["position", "aSize", "aAlpha", "aColor"]) {
        const attribute = geometry.getAttribute(name)

        attribute.needsUpdate = true
      }
    },
    clear: () => {
      ages.fill(1)
      alphas.fill(0)
    },
    dispose: () => {
      geometry.dispose()
      material.dispose()
    },
  }
}

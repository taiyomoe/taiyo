import { Color, Mesh, PlaneGeometry, ShaderMaterial } from "three"

const VERTEX = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
const FLOOR_FRAGMENT = `
uniform vec3 uBase;
uniform vec3 uSpot;
uniform float uSpotStrength;
varying vec2 vUv;

void main() {
  vec2 world = (vUv - 0.5) * 24.0;
  float spot = exp(-dot(world, world) / 9.0) * uSpotStrength;
  vec2 footprint = world / vec2(1.55, 1.05);
  float shadow = 1.0 - 0.82 * exp(-dot(footprint, footprint) * 1.4);
  vec3 color = uBase + uSpot * spot * shadow;
  float fade = smoothstep(11.0, 2.5, length(world));
  gl_FragColor = vec4(mix(uBase, color, fade) * shadow, 1.0);
}
`

export type Stage = ReturnType<typeof createStage>

export const createStage = (base: string) => {
  const baseColor = new Color(base)
  const spot = new Color("#ffffff")
  const floorUniforms = {
    uBase: { value: baseColor },
    uSpot: { value: spot },
    uSpotStrength: { value: 0.18 },
  }
  const floorMaterial = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FLOOR_FRAGMENT,
    uniforms: floorUniforms,
  })
  const floor = new Mesh(new PlaneGeometry(24, 24), floorMaterial)
  const targetSpot = new Color("#ffffff")
  let spotStrength = 0.18
  let spotTarget = 0.18

  floor.rotation.x = -Math.PI / 2

  return {
    floor,
    setTint: (hex: string, strength: number) => {
      targetSpot.set(hex)
      spotTarget = strength
    },
    update: (delta: number) => {
      const blend = Math.min(1, delta * 3)

      spot.lerp(targetSpot, blend)
      spotStrength += (spotTarget - spotStrength) * blend
      floorUniforms.uSpotStrength.value = spotStrength
    },
    dispose: () => {
      floor.geometry.dispose()
      floorMaterial.dispose()
    },
  }
}

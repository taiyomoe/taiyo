import {
  AdditiveBlending,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
} from "three"

const PILLAR_VERTEX = `
varying vec2 vUv;
varying vec3 vNormalView;
varying vec3 vViewDirection;

void main() {
  vUv = uv;
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vNormalView = normalize(normalMatrix * normal);
  vViewDirection = normalize(-viewPosition.xyz);
  gl_Position = projectionMatrix * viewPosition;
}
`
const PILLAR_FRAGMENT = `
uniform vec3 uColor;
uniform float uIntensity;
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormalView;
varying vec3 vViewDirection;

void main() {
  float facing = abs(dot(vNormalView, vViewDirection));
  float core = pow(facing, 2.2);
  float vertical = smoothstep(0.02, 0.2, vUv.y) * pow(1.0 - vUv.y, 1.8);
  float streaks = 0.6 + 0.4 * sin(vUv.x * 62.0 + uTime * 0.8) * sin(vUv.y * 9.0 - uTime * 5.0);
  float alpha = core * vertical * streaks * uIntensity;
  gl_FragColor = vec4(uColor * (1.4 + core * 1.6), alpha);
}
`
const SHAFT_FRAGMENT = `
uniform vec3 uColor;
uniform float uIntensity;
varying vec2 vUv;

void main() {
  float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
  float along = smoothstep(0.0, 0.04, vUv.y) * pow(1.0 - vUv.y, 2.6);
  float alpha = pow(across, 3.0) * along * uIntensity;
  gl_FragColor = vec4(uColor * 1.8, alpha);
}
`
const SHAFT_VERTEX = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
const RING_FRAGMENT = `
uniform vec3 uColor;
uniform float uProgress;
varying vec2 vUv;

void main() {
  float radius = length(vUv - 0.5) * 2.0;
  float edge = mix(0.15, 0.97, uProgress);
  float fadeOut = pow(1.0 - uProgress, 1.6);
  float ring = smoothstep(0.035, 0.0, abs(radius - edge)) * fadeOut;
  float fill = smoothstep(edge, 0.0, radius) * 0.05 * fadeOut;
  gl_FragColor = vec4(uColor * 1.4, (ring * 0.8 + fill) * step(radius, 1.0));
}
`
const additive = (
  vertexShader: string,
  fragmentShader: string,
  uniforms: Record<string, { value: unknown }>,
) =>
  new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
  })

export const createBeams = (mouthHeight: number) => {
  const group = new Group()
  const color = new Color("#ffffff")
  const pillarUniforms = { uColor: { value: color }, uIntensity: { value: 0 }, uTime: { value: 0 } }
  const shaftUniforms = { uColor: { value: color }, uIntensity: { value: 0 } }
  const ringUniforms = { uColor: { value: color }, uProgress: { value: 1 } }
  const pillarMaterial = additive(PILLAR_VERTEX, PILLAR_FRAGMENT, pillarUniforms)
  const pillarGeometry = new CylinderGeometry(1.25, 0.72, 10, 48, 1, true)

  pillarGeometry.translate(0, 5, 0)

  const pillar = new Mesh(pillarGeometry, pillarMaterial)

  pillar.position.y = mouthHeight
  group.add(pillar)

  const shafts = new Group()
  const shaftMaterial = additive(SHAFT_VERTEX, SHAFT_FRAGMENT, shaftUniforms)
  const shaftGeometry = new PlaneGeometry(0.34, 7)

  shaftGeometry.translate(0, 3.5, 0)

  for (let index = 0; index < 14; index += 1) {
    const holder = new Group()
    const shaft = new Mesh(shaftGeometry, shaftMaterial)

    holder.rotation.y = (index / 14) * Math.PI * 2
    shaft.position.x = 0.3
    shaft.rotation.z = -0.28 - (index % 3) * 0.16
    shaft.scale.y = 0.7 + (index % 4) * 0.18
    holder.add(shaft)
    shafts.add(holder)
  }

  shafts.position.y = mouthHeight
  group.add(shafts)

  const ringMaterial = additive(SHAFT_VERTEX, RING_FRAGMENT, ringUniforms)
  const ring = new Mesh(new PlaneGeometry(14, 14), ringMaterial)

  ring.rotation.x = -Math.PI / 2
  ring.position.y = 0.01
  group.add(ring)

  let intensity = 0
  let target = 0
  let ringProgress = 1

  return {
    group,
    ignite: (hex: string) => {
      color.set(hex)
      target = 1
      intensity = 1.8
      ringProgress = 0
    },
    reset: () => {
      target = 0
      intensity = 0
      ringProgress = 1
    },
    update: (delta: number, time: number) => {
      intensity += (target * 0.6 - intensity) * Math.min(1, delta * 2.2)
      ringProgress = Math.min(1, ringProgress + delta * 0.9)
      pillarUniforms.uIntensity.value = intensity
      pillarUniforms.uTime.value = time
      shaftUniforms.uIntensity.value = intensity * 0.55
      ringUniforms.uProgress.value = ringProgress
      pillar.scale.set(
        0.35 + intensity * 0.45,
        0.2 + Math.min(1, intensity) * 0.8,
        0.35 + intensity * 0.45,
      )
      shafts.rotation.y = time * 0.12
      group.visible = intensity > 0.002 || ringProgress < 1
    },
    dispose: () => {
      pillarGeometry.dispose()
      shaftGeometry.dispose()
      ring.geometry.dispose()
      pillarMaterial.dispose()
      shaftMaterial.dispose()
      ringMaterial.dispose()
    },
  }
}

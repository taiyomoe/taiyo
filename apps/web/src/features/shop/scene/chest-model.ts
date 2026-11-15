import type { LootBoxKey } from "@taiyomoe/db/loot-boxes"
import {
  AdditiveBlending,
  BoxGeometry,
  type BufferGeometry,
  Color,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  type Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PlaneGeometry,
  PointLight,
  SphereGeometry,
  type Texture,
} from "three"
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js"
import { CHEST_PALETTES, type ChestPalette } from "@/features/shop/scene/chest-palettes"
import {
  createBrushedTexture,
  createFacetTexture,
  createWoodTexture,
} from "@/features/shop/scene/textures"

export const CHEST_WIDTH = 2.4

export const CHEST_DEPTH = 1.5

export const CHEST_HEIGHT = 1.15

const LID_RADIUS = CHEST_DEPTH / 2
const BAND_X = 0.78
const RUNES: ReadonlyArray<ReadonlyArray<[number, number, number, number]>> = [
  [
    [0, 0.12, 0.02, 0.26],
    [-0.06, 0.02, 0.14, 0.02],
    [0.05, -0.08, 0.1, 0.02],
  ],
  [
    [-0.05, 0, 0.02, 0.28],
    [0.05, 0, 0.02, 0.28],
    [0, 0.1, 0.12, 0.02],
  ],
]
const glowMaterial = (color: string, opacity: number) =>
  new MeshBasicMaterial({
    color: new Color(color).multiplyScalar(1.6),
    transparent: true,
    opacity,
    blending: AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  })
const createBodyMaterial = (palette: ChestPalette, textures: Texture[]) => {
  if (palette.finish === "wood") {
    const map = createWoodTexture(palette.body, palette.bodyAccent)

    textures.push(map)

    return new MeshPhysicalMaterial({
      map,
      roughness: 0.66,
      clearcoat: 0.32,
      clearcoatRoughness: 0.4,
      envMapIntensity: 0.7,
    })
  }

  if (palette.finish === "crystal") {
    return new MeshPhysicalMaterial({
      color: palette.body,
      transmission: 1,
      thickness: 1.1,
      ior: 1.75,
      roughness: 0.06,
      attenuationColor: new Color(palette.bodyAccent),
      attenuationDistance: 1.6,
      iridescence: 0.45,
      iridescenceIOR: 1.5,
      clearcoat: 1,
      specularIntensity: 1,
    })
  }

  if (palette.finish === "obsidian") {
    const roughnessMap = createFacetTexture()

    textures.push(roughnessMap)

    return new MeshPhysicalMaterial({
      color: palette.body,
      metalness: 0.25,
      roughness: 0.18,
      roughnessMap,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      sheen: 0.6,
      sheenColor: new Color(palette.bodyAccent),
    })
  }

  const brushed = createBrushedTexture(3)

  textures.push(brushed)

  return new MeshPhysicalMaterial({
    color: palette.body,
    metalness: 0.88,
    roughness: 0.5,
    roughnessMap: brushed,
    bumpMap: brushed,
    bumpScale: 0.6,
  })
}

export type ChestModel = ReturnType<typeof createChestModel>

export const createChestModel = (tier: LootBoxKey) => {
  const palette = CHEST_PALETTES[tier]
  const textures: Texture[] = []
  const geometries: BufferGeometry[] = []
  const materials = new Set<Material>()
  const root = new Group()
  const body = new Group()
  const lid = new Group()
  const brushed = createBrushedTexture(19)

  textures.push(brushed)

  const bodyMaterial = createBodyMaterial(palette, textures)
  const trimMaterial = new MeshPhysicalMaterial({
    color: palette.trim,
    metalness: 1,
    roughness: palette.trimRoughness,
    roughnessMap: brushed,
    iridescence: palette.trimIridescence,
    iridescenceIOR: 1.7,
    clearcoat: palette.finish === "obsidian" ? 1 : 0.2,
    envMapIntensity: 0.75,
  })
  const gemMaterial = new MeshPhysicalMaterial({
    color: palette.gem,
    transmission: 0.92,
    thickness: 0.35,
    ior: 2.3,
    roughness: 0,
    emissive: new Color(palette.gem),
    emissiveIntensity: 0.35,
    flatShading: true,
    specularIntensity: 1,
  })
  const seamMaterial = glowMaterial(palette.glow, 0)
  const innerMaterial = glowMaterial(palette.glow, 0)
  const runeMaterial = palette.rune === null ? null : glowMaterial(palette.rune, 0.9)
  const add = (
    parent: Group,
    geometry: BufferGeometry,
    material: Material,
    x: number,
    y: number,
    z: number,
  ) => {
    const mesh = new Mesh(geometry, material)

    geometries.push(geometry)
    materials.add(material)
    mesh.position.set(x, y, z)
    parent.add(mesh)

    return mesh
  }

  add(
    body,
    new RoundedBoxGeometry(CHEST_WIDTH, CHEST_HEIGHT, CHEST_DEPTH, 4, 0.05),
    bodyMaterial,
    0,
    CHEST_HEIGHT / 2,
    0,
  )

  if (palette.finish === "crystal") {
    add(
      body,
      new BoxGeometry(CHEST_WIDTH * 0.72, CHEST_HEIGHT * 0.55, CHEST_DEPTH * 0.55),
      glowMaterial(palette.glow, 0.22),
      0,
      CHEST_HEIGHT * 0.5,
      0,
    )
  }

  add(
    body,
    new RoundedBoxGeometry(CHEST_WIDTH + 0.08, 0.13, CHEST_DEPTH + 0.08, 2, 0.035),
    trimMaterial,
    0,
    0.065,
    0,
  )
  add(
    body,
    new RoundedBoxGeometry(CHEST_WIDTH + 0.06, 0.08, CHEST_DEPTH + 0.06, 2, 0.025),
    trimMaterial,
    0,
    CHEST_HEIGHT - 0.04,
    0,
  )

  for (const side of [-1, 1]) {
    add(
      body,
      new RoundedBoxGeometry(0.2, CHEST_HEIGHT + 0.02, CHEST_DEPTH + 0.06, 2, 0.025),
      trimMaterial,
      side * BAND_X,
      CHEST_HEIGHT / 2,
      0,
    )

    for (const depth of [-1, 1]) {
      add(
        body,
        new RoundedBoxGeometry(0.15, CHEST_HEIGHT + 0.03, 0.15, 2, 0.04),
        trimMaterial,
        side * (CHEST_WIDTH / 2),
        CHEST_HEIGHT / 2,
        depth * (CHEST_DEPTH / 2),
      )
    }
  }

  const rivetGeometry = new SphereGeometry(0.026, 12, 8)
  const rivets = new InstancedMesh(rivetGeometry, trimMaterial, 16)

  geometries.push(rivetGeometry)
  const placement = new Matrix4()
  let rivet = 0

  for (const side of [-1, 1]) {
    for (const offset of [-0.055, 0.055]) {
      for (const y of [0.3, 0.85]) {
        placement.makeTranslation(side * BAND_X + offset, y, CHEST_DEPTH / 2 + 0.035)
        rivets.setMatrixAt(rivet, placement)
        rivet += 1
        placement.makeTranslation(side * BAND_X + offset, y, -(CHEST_DEPTH / 2 + 0.035))
        rivets.setMatrixAt(rivet, placement)
        rivet += 1
      }
    }
  }

  body.add(rivets)

  add(
    body,
    new RoundedBoxGeometry(0.46, 0.5, 0.07, 3, 0.03),
    trimMaterial,
    0,
    CHEST_HEIGHT - 0.24,
    CHEST_DEPTH / 2 + 0.035,
  )
  add(
    body,
    new BoxGeometry(0.045, 0.11, 0.02),
    new MeshBasicMaterial({ color: "#050505" }),
    0,
    CHEST_HEIGHT - 0.38,
    CHEST_DEPTH / 2 + 0.072,
  )

  const gem = add(
    body,
    new IcosahedronGeometry(0.1, 0),
    gemMaterial,
    0,
    CHEST_HEIGHT - 0.2,
    CHEST_DEPTH / 2 + 0.11,
  )

  gem.scale.set(1, 1.25, 0.7)

  if (runeMaterial !== null) {
    for (const [index, side] of [-1, 1].entries()) {
      for (const [x, y, width, height] of RUNES[index] ?? []) {
        add(
          body,
          new BoxGeometry(width, height, 0.012),
          runeMaterial,
          side * 0.99 + x,
          CHEST_HEIGHT * 0.48 + y,
          CHEST_DEPTH / 2 + 0.006,
        )
      }
    }
  }

  for (const [width, depth, x, z] of [
    [CHEST_WIDTH - 0.04, 0.035, 0, CHEST_DEPTH / 2 - 0.02],
    [CHEST_WIDTH - 0.04, 0.035, 0, -(CHEST_DEPTH / 2 - 0.02)],
    [0.035, CHEST_DEPTH - 0.04, CHEST_WIDTH / 2 - 0.02, 0],
    [0.035, CHEST_DEPTH - 0.04, -(CHEST_WIDTH / 2 - 0.02), 0],
  ] as const) {
    add(body, new BoxGeometry(width, 0.02, depth), seamMaterial, x, CHEST_HEIGHT + 0.004, z)
  }

  const inner = add(
    body,
    new PlaneGeometry(CHEST_WIDTH - 0.14, CHEST_DEPTH - 0.14),
    innerMaterial,
    0,
    CHEST_HEIGHT + 0.01,
    0,
  )

  inner.rotation.x = -Math.PI / 2

  const lidShell = new CylinderGeometry(
    LID_RADIUS,
    LID_RADIUS,
    CHEST_WIDTH,
    72,
    1,
    false,
    0,
    Math.PI,
  )

  lidShell.rotateZ(Math.PI / 2)
  lidShell.translate(0, 0, LID_RADIUS)
  add(lid, lidShell, bodyMaterial, 0, 0, 0)

  for (const side of [-1, 1]) {
    const band = new CylinderGeometry(
      LID_RADIUS + 0.035,
      LID_RADIUS + 0.035,
      0.2,
      72,
      1,
      false,
      0,
      Math.PI,
    )

    band.rotateZ(Math.PI / 2)
    band.translate(0, 0, LID_RADIUS)
    add(lid, band, trimMaterial, side * BAND_X, 0, 0)

    const cap = new CylinderGeometry(
      LID_RADIUS + 0.02,
      LID_RADIUS + 0.02,
      0.14,
      72,
      1,
      false,
      0,
      Math.PI,
    )

    cap.rotateZ(Math.PI / 2)
    cap.translate(0, 0, LID_RADIUS)
    add(lid, cap, trimMaterial, side * (CHEST_WIDTH / 2), 0, 0)
  }

  const underside = add(
    lid,
    new PlaneGeometry(CHEST_WIDTH - 0.02, CHEST_DEPTH - 0.02),
    new MeshPhysicalMaterial({
      color: "#07060a",
      roughness: 0.85,
      envMapIntensity: 0.15,
    }),
    0,
    0.002,
    LID_RADIUS,
  )

  underside.rotation.x = Math.PI / 2

  add(
    lid,
    new RoundedBoxGeometry(CHEST_WIDTH + 0.06, 0.07, CHEST_DEPTH + 0.06, 2, 0.025),
    trimMaterial,
    0,
    0.035,
    LID_RADIUS,
  )
  add(
    lid,
    new RoundedBoxGeometry(0.22, 0.24, 0.05, 2, 0.02),
    trimMaterial,
    0,
    -0.02,
    CHEST_DEPTH + 0.06,
  )

  if (runeMaterial !== null) {
    const rim = new CylinderGeometry(
      LID_RADIUS + 0.012,
      LID_RADIUS + 0.012,
      0.025,
      72,
      1,
      true,
      0,
      Math.PI,
    )

    rim.rotateZ(Math.PI / 2)
    rim.translate(0, 0, LID_RADIUS)

    for (const x of [-0.99, 0.99]) {
      add(lid, rim, runeMaterial, x, 0, 0)
    }
  }

  lid.position.set(0, CHEST_HEIGHT, -LID_RADIUS)

  const light = new PointLight(palette.glow, 0, 6, 1.6)

  light.position.set(0, CHEST_HEIGHT + 0.2, 0)
  root.add(body, lid, light)

  return {
    root,
    lid,
    gem,
    light,
    seamMaterial,
    innerMaterial,
    runeMaterial,
    gemMaterial,
    palette,
    dispose: () => {
      for (const geometry of new Set(geometries)) {
        geometry.dispose()
      }

      for (const material of materials) {
        material.dispose()
      }

      for (const texture of textures) {
        texture.dispose()
      }
    },
  }
}

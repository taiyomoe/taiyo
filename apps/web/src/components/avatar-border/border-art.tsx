import type { AvatarBorder } from "@taiyomoe/db/cosmetics"
import type { ReactElement } from "react"
import { CircuitBorder } from "@/components/avatar-border/borders/circuit"
import { DuskBorder } from "@/components/avatar-border/borders/dusk"
import { EclipseBorder } from "@/components/avatar-border/borders/eclipse"
import { FrostbiteBorder } from "@/components/avatar-border/borders/frostbite"
import { HaloBorder } from "@/components/avatar-border/borders/halo"
import { NebulaBorder } from "@/components/avatar-border/borders/nebula"
import { OrbitBorder } from "@/components/avatar-border/borders/orbit"
import { PetalsBorder } from "@/components/avatar-border/borders/petals"
import { PhoenixBorder } from "@/components/avatar-border/borders/phoenix"
import { SolarBorder } from "@/components/avatar-border/borders/solar"
import { ThornsBorder } from "@/components/avatar-border/borders/thorns"
import { TidalBorder } from "@/components/avatar-border/borders/tidal"

export const BORDER_ART: Record<AvatarBorder, () => ReactElement> = {
  halo: HaloBorder,
  dusk: DuskBorder,
  petals: PetalsBorder,
  tidal: TidalBorder,
  circuit: CircuitBorder,
  orbit: OrbitBorder,
  frostbite: FrostbiteBorder,
  thorns: ThornsBorder,
  solar: SolarBorder,
  phoenix: PhoenixBorder,
  nebula: NebulaBorder,
  eclipse: EclipseBorder,
}

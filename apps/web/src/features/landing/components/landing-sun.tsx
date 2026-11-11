import type { RefObject } from "react"
import * as stylex from "@stylexjs/stylex"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { Animated } from "@/components/scene/animated"
import { scene } from "@/components/scene/scene.stylex"
import { PlasmaSun } from "@/components/scene/sun/plasma-sun"

export type Parallax = {
  x: number
  y: number
}

const styles = stylex.create({
  field: {
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
    position: "absolute",
  },
  aurora: {
    inset: "-20% -20% 10% -20%",
    backgroundImage: `radial-gradient(58% 70% at 50% 92%, color-mix(in srgb, ${scene.brand} 50%, transparent), transparent 72%)`,
    filter: "blur(24px)",
    position: "absolute",
  },
  orbit: {
    aspectRatio: "1",
    position: "absolute",
    left: "50%",
    top: "calc(116% - 470px)",
    width: { default: "470px", [breakpoints.sm]: "max(470px, 76%)" },
  },
  vignette: {
    inset: 0,
    backgroundImage: `linear-gradient(180deg, ${scene.night} 0%, color-mix(in srgb, ${scene.night} 34%, transparent) 22%, color-mix(in srgb, ${scene.night} 5%, transparent) 48%, color-mix(in srgb, ${scene.night} 4%, transparent) 72%, color-mix(in srgb, ${scene.night} 35%, transparent) 100%)`,
    position: "absolute",
  },
})

export const LandingSun = ({
  parallax,
  surfaceRef,
}: {
  parallax: Parallax
  surfaceRef: RefObject<HTMLElement | null>
}) => (
  <div sx={styles.field}>
    <Animated sx={styles.aurora} animation="scene-aurora 16s ease-in-out infinite" />
    <PlasmaSun
      surfaceRef={surfaceRef}
      orbit={styles.orbit}
      orbitStyle={{
        transform: `translate(calc(-50% + ${parallax.x * -0.9}px), ${parallax.y * -0.6}px)`,
      }}
    />
    <div sx={styles.vignette} />
  </div>
)

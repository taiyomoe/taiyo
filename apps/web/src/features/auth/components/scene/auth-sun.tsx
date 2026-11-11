import type { RefObject } from "react"
import * as stylex from "@stylexjs/stylex"
import { Animated } from "@/components/scene/animated"
import { scene } from "@/components/scene/scene.stylex"
import { PlasmaSun } from "@/components/scene/sun/plasma-sun"

const styles = stylex.create({
  root: {
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
    position: "absolute",
  },
  aurora: {
    background: `radial-gradient(60% 80% at 50% 100%, color-mix(in srgb, ${scene.brand} 42%, transparent), transparent 70%)`,
    inset: "-20% -20% 30% -20%",
    filter: "blur(20px)",
    position: "absolute",
  },
  orbit: {
    position: "absolute",
    transform: "translateX(-50%)",
    bottom: "-38%",
    height: "27.5rem",
    left: "50%",
    width: "27.5rem",
  },
  vignette: {
    background: `linear-gradient(180deg, ${scene.night} 0%, rgba(18,10,7,0.35) 26%, rgba(18,10,7,0.5) 50%, rgba(18,10,7,0.15) 78%, rgba(18,10,7,0.35) 100%)`,
    inset: 0,
    position: "absolute",
  },
})

export const AuthSun = ({ surfaceRef }: { surfaceRef: RefObject<HTMLElement | null> }) => (
  <div sx={styles.root}>
    <Animated sx={styles.aurora} animation="scene-aurora 14s ease-in-out infinite" />
    <PlasmaSun surfaceRef={surfaceRef} orbit={styles.orbit} />
    <div sx={styles.vignette} />
  </div>
)

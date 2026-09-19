import * as stylex from "@stylexjs/stylex"
import type { CSSProperties } from "react"

import { consts } from "@taiyomoe/ui/styles/tokens.stylex"

import { Animated } from "@/components/scene/animated"
import { scene } from "@/components/scene/scene.stylex"
import { SunRays } from "@/components/scene/sun-rays"

export type Parallax = { x: number; y: number }

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
    position: "absolute",
    bottom: {
      default: "calc(20% - var(--sun-size))",
      [consts.sm]: "calc(32% - var(--sun-size))",
    },
    height: "var(--sun-size)",
    left: "50%",
    width: "var(--sun-size)",
  },
  disc: {
    inset: 0,
    borderRadius: "50%",
    backgroundImage: `radial-gradient(circle at 50% 40%, ${scene.goldPale} 0%, #ffd060 26%, ${scene.gold} 46%, ${scene.brand} 70%, #c8301c 100%)`,
    boxShadow: `0 0 140px 40px color-mix(in srgb, #ff8c28 55%, transparent), 0 0 280px 110px color-mix(in srgb, ${scene.gold} 30%, transparent)`,
    position: "absolute",
  },
  vignette: {
    inset: 0,
    backgroundImage: `linear-gradient(180deg, ${scene.night} 0%, color-mix(in srgb, ${scene.night} 34%, transparent) 22%, color-mix(in srgb, ${scene.night} 5%, transparent) 48%, color-mix(in srgb, ${scene.night} 4%, transparent) 72%, color-mix(in srgb, ${scene.night} 35%, transparent) 100%)`,
    position: "absolute",
  },
})

export const LandingSun = ({ parallax }: { parallax: Parallax }) => (
  <div sx={styles.field}>
    <Animated sx={styles.aurora} animation="scene-aurora 16s ease-in-out infinite" />
    <Animated
      sx={styles.orbit}
      style={
        {
          "--sun-size": "70vw",
          transform: `translate(calc(-50% + ${parallax.x * -0.9}px), ${parallax.y * -0.6}px)`,
        } as CSSProperties
      }
    >
      <SunRays
        count={52}
        innerRadius="calc(var(--sun-size) / 2)"
        minReach={0.22}
        maxReach={0.62}
        minWidth={5}
        maxWidth={14}
        spinSeconds={130}
      />
      <Animated sx={styles.disc} animation="scene-sun-breathe 7s ease-in-out infinite" />
    </Animated>
    <div sx={styles.vignette} />
  </div>
)

import * as stylex from "@stylexjs/stylex"

import { Animated } from "@/components/scene/animated"
import { scene } from "@/components/scene/scene.stylex"
import { SunRays } from "@/components/scene/sun-rays"

const styles = stylex.create({
  root: {
    inset: 0,
    overflow: "hidden",
    position: "absolute",
  },
  aurora: {
    background: `radial-gradient(60% 80% at 50% 100%, color-mix(in srgb, ${scene.brand} 42%, transparent), transparent 70%)`,
    inset: "-20% -20% 30% -20%",
    filter: "blur(20px)",
    position: "absolute",
  },
  system: {
    position: "absolute",
    transform: "translateX(-50%)",
    bottom: "-38%",
    height: "27.5rem",
    left: "50%",
    width: "27.5rem",
  },
  disc: {
    background: `radial-gradient(circle at 50% 42%, ${scene.goldPale} 0%, ${scene.gold} 30%, ${scene.brand} 64%, #b5281a 100%)`,
    inset: 0,
    borderRadius: "9999px",
    boxShadow: "0 0 120px 30px rgba(242,69,45,0.5), 0 0 220px 80px rgba(255,184,32,0.25)",
    position: "absolute",
  },
  vignette: {
    background: `linear-gradient(180deg, ${scene.night} 0%, rgba(18,10,7,0.35) 26%, rgba(18,10,7,0.5) 50%, rgba(18,10,7,0.15) 78%, rgba(18,10,7,0.35) 100%)`,
    inset: 0,
    position: "absolute",
  },
})

export const AuthSun = () => (
  <div sx={styles.root}>
    <Animated sx={styles.aurora} animation="scene-aurora 14s ease-in-out infinite" />
    <div sx={styles.system}>
      <SunRays />
      <Animated sx={styles.disc} animation="scene-sun-breathe 7s ease-in-out infinite" />
    </div>
    <div sx={styles.vignette} />
  </div>
)

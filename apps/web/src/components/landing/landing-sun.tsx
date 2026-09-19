import * as stylex from "@stylexjs/stylex"
import type { CSSProperties } from "react"

import { consts } from "@taiyomoe/ui/styles/tokens.stylex"

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
  // Warm wash pooled at the horizon, where the disc crests. Weighted low
  // (92% down its own box) so the light climbs the frame instead of sitting
  // in a ring around the sun.
  aurora: {
    inset: "-20% -20% 10% -20%",
    backgroundImage: `radial-gradient(58% 70% at 50% 92%, color-mix(in srgb, ${scene.brand} 50%, transparent), transparent 72%)`,
    filter: "blur(24px)",
    position: "absolute",
  },
  // Rays and disc share this box, so they stay exactly concentric — SunRays
  // renders `inset: 0` and measures each ray off the radius. The disc paints
  // after, hiding the ray bases behind an opaque edge.
  orbit: {
    position: "absolute",
    // `bottom` resolves against the hero's height, so subtracting the disc's
    // own size from a percentage parks its TOP edge at that line whatever the
    // viewport. At 70% of the page width the disc is wider than the fold is
    // tall, so it is set low — only the top arc comes into frame, and the copy
    // keeps the sky above it.
    //
    // Lower still on a phone: the headline and the paragraph wrap onto twice as
    // many lines there, so the copy eats a much bigger share of the fold and a
    // fixed line would cut through it.
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
  // Seals the top of the frame to the page ground and puts a little weight back
  // at the very bottom, leaving the middle open for the sun.
  vignette: {
    inset: 0,
    backgroundImage: `linear-gradient(180deg, ${scene.night} 0%, color-mix(in srgb, ${scene.night} 34%, transparent) 22%, color-mix(in srgb, ${scene.night} 5%, transparent) 48%, color-mix(in srgb, ${scene.night} 4%, transparent) 72%, color-mix(in srgb, ${scene.night} 35%, transparent) 100%)`,
    position: "absolute",
  },
})

/**
 * The landing hero's sun: a disc cresting from just below the fold with its ray
 * cluster turning behind it, exactly as the mockup stages it. The copy reads on
 * the dark sky above; LandingHero's own scrim softens the gap between the two.
 */
export const LandingSun = ({ parallax }: { parallax: Parallax }) => {
  // The scene keyframes are global CSS (styles.css) because the auth screen
  // drives them from inline styles too, and StyleX's `animationName` only
  // accepts a `keyframes()` handle — so they are applied the same way here.
  const orbitProps = stylex.props(styles.orbit)
  const discProps = stylex.props(styles.disc)
  const auroraProps = stylex.props(styles.aurora)

  return (
    <div {...stylex.props(styles.field)}>
      <div
        className={auroraProps.className}
        style={{ ...auroraProps.style, animation: "scene-aurora 16s ease-in-out infinite" }}
      />
      <div
        className={orbitProps.className}
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
        <div
          className={discProps.className}
          style={{ ...discProps.style, animation: "scene-sun-breathe 7s ease-in-out infinite" }}
        />
      </div>
      <div {...stylex.props(styles.vignette)} />
    </div>
  )
}

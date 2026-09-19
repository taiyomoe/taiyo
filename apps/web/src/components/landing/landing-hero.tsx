import { ArrowDown01Icon, Compass01Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as stylex from "@stylexjs/stylex"
import { font, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { type MouseEvent, useState } from "react"

import { GhostAnchor } from "@/components/buttons/ghost-anchor"
import { SunLink } from "@/components/buttons/sun-button"
import { Eyebrow, Stars } from "@/components/landing/landing-atoms"
import { LandingSun, type Parallax } from "@/components/landing/landing-sun"
import { Embers } from "@/components/scene/embers"
import { scene, sceneFont } from "@/components/scene/scene.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  hero: {
    overflow: "hidden",
    paddingInline: "1.5rem",
    alignItems: "center",
    backgroundColor: scene.night,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
    textAlign: "center",
    minHeight: "100vh",
    // Asymmetric on purpose: the copy is centred in what's left after the
    // padding, so reserving the bottom lifts it clear of the sun's arc.
    paddingBottom: "clamp(10rem, 28vh, 20rem)",
    paddingTop: "7.5rem",
  },
  content: {
    gap: "1.625rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 3,
    maxWidth: "55rem",
  },
  // A soft pool of shade behind the copy, settling it into the sky above the
  // sun. On its own layer (z-index 1, under the copy's 3) rather than on the
  // copy block, so its edges never track the text box — and kept clear of the
  // disc, whose brightness would otherwise reveal the ellipse as a seam.
  scrim: {
    backgroundImage:
      "radial-gradient(60% 56% at 50% 46%, rgba(14,7,4,0.62), rgba(14,7,4,0.28) 60%, transparent 78%)",
    filter: "blur(8px)",
    pointerEvents: "none",
    position: "absolute",
    transform: "translate(-50%, -50%)",
    zIndex: 1,
    height: "32.5rem",
    left: "50%",
    top: "42%",
    width: "min(51.25rem, 92vw)",
  },
  title: {
    margin: 0,
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: "clamp(2.875rem, 7vw, 5.75rem)",
    fontWeight: font.weightBold,
    letterSpacing: "-0.03em",
    lineHeight: 0.98,
    textShadow: "0 4px 40px rgba(10,5,3,0.6)",
    textWrap: "balance",
  },
  subtitle: {
    margin: 0,
    color: `color-mix(in srgb, ${scene.paper} 74%, transparent)`,
    fontSize: "clamp(1.0625rem, 1.7vw, 1.3125rem)",
    lineHeight: 1.5,
    textWrap: "pretty",
    maxWidth: "35rem",
  },
  actions: {
    gap: "0.875rem",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "0.375rem",
  },
  rating: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    marginTop: "0.5rem",
  },
  ratingLabel: {
    color: `color-mix(in srgb, ${scene.paper} 60%, transparent)`,
    fontSize: text.base,
  },
  ratingScore: {
    color: scene.paper,
    fontWeight: font.weightBold,
  },
  scrollCue: {
    insetInline: 0,
    color: `color-mix(in srgb, ${scene.paper} 40%, transparent)`,
    display: "flex",
    justifyContent: "center",
    position: "absolute",
    zIndex: 4,
    bottom: "1.375rem",
  },
})

/**
 * The hero. The sun crests from below the fold and the copy sits on the sky
 * above it, staged as in the mockup. Layers, back to front: LandingSun (0) →
 * scrim (1) → copy (3). Anything readable belongs on 3.
 */
export const LandingHero = () => {
  const [parallax, setParallax] = useState<Parallax>({ x: 0, y: 0 })
  const onMouseMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()

    setParallax({
      x: ((event.clientX - rect.left - rect.width / 2) / rect.width) * 40,
      y: ((event.clientY - rect.top - rect.height / 2) / rect.height) * 40,
    })
  }

  return (
    <section sx={styles.hero} onMouseMove={onMouseMove}>
      <LandingSun parallax={parallax} />
      <Embers count={30} />
      <div sx={styles.scrim} />

      <div sx={styles.content}>
        <Eyebrow centered>{m.landing_hero_eyebrow()}</Eyebrow>
        <h1 sx={styles.title}>{m.landing_hero_title()}</h1>
        <p sx={styles.subtitle}>{m.landing_hero_subtitle()}</p>
        <div sx={styles.actions}>
          <SunLink to="/auth/sign-up">
            <HugeiconsIcon icon={Sun03Icon} size={20} />
            {m.landing_hero_cta_primary()}
          </SunLink>
          <GhostAnchor href="#titles">
            <HugeiconsIcon icon={Compass01Icon} size={19} />
            {m.landing_hero_cta_secondary()}
          </GhostAnchor>
        </div>
        <div sx={styles.rating}>
          <Stars filled={5} size={16} />
          <span sx={styles.ratingLabel}>
            <b sx={styles.ratingScore}>{m.landing_hero_rating_score()}</b>{" "}
            {m.landing_hero_rating_label()}
          </span>
        </div>
      </div>

      <a href="#titles" aria-label={m.landing_hero_scroll_hint()} sx={styles.scrollCue}>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={22}
          style={{ animation: "scene-bob 2.4s ease-in-out infinite" }}
        />
      </a>
    </section>
  )
}

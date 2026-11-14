import { ArrowDown01Icon, Compass01Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as stylex from "@stylexjs/stylex"
import { Embers } from "@taiyomoe/ui/components/scene/embers"
import { LandingSun } from "@taiyomoe/ui/components/scene/landing-sun"
import { scene, sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { font } from "@taiyomoe/ui/styles/tokens.stylex"
import { useRef } from "react"
import { GhostAnchor } from "@/components/buttons/ghost-anchor"
import { SunLink } from "@/components/buttons/sun-link"
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
    touchAction: "pan-y pinch-zoom",
    minHeight: "100vh",
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

export const LandingHero = () => {
  const heroRef = useRef<HTMLElement>(null)

  return (
    <section ref={heroRef} sx={styles.hero}>
      <LandingSun surfaceRef={heroRef} />
      <Embers count={30} />
      <div sx={styles.scrim} />

      <div sx={styles.content}>
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

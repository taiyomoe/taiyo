import { Sun03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as stylex from "@stylexjs/stylex"
import { font, radius, text } from "@taiyomoe/ui/styles/tokens.stylex"

import { GhostAnchor } from "@/components/buttons/ghost-anchor"
import { SunLink } from "@/components/buttons/sun-button"
import { Eyebrow } from "@/components/landing/landing-atoms"
import { scene, sceneFont } from "@/components/scene/scene.stylex"
import { m } from "@/paraglide/messages"

// Deliberately NOT another sun scene — the hero already owns that. This is a
// maroon-to-red banner with the corona pushed off one corner and the kanji as a
// watermark, so the page ends on the same warmth without repeating itself.
const styles = stylex.create({
  band: {
    paddingBlock: "clamp(4.375rem,10vw,7.5rem)",
    paddingInline: "clamp(1.25rem,4vw,2.5rem)",
    backgroundColor: scene.night,
  },
  banner: {
    borderColor: `color-mix(in srgb, ${scene.gold} 30%, transparent)`,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: "1px",
    marginInline: "auto",
    overflow: "hidden",
    paddingBlock: "clamp(3rem,7vw,5.25rem)",
    paddingInline: "clamp(1.75rem,6vw,4.75rem)",
    backgroundImage: `linear-gradient(118deg, #5c1b11 0%, #7d2014 36%, #a92a18 70%, #c8341e 100%)`,
    boxShadow: "0 40px 90px rgba(0,0,0,0.5)",
    position: "relative",
    maxWidth: "68.75rem",
  },
  corona: {
    borderRadius: "50%",
    backgroundImage: `radial-gradient(circle, color-mix(in srgb, ${scene.goldLight} 55%, transparent), color-mix(in srgb, ${scene.brand} 20%, transparent) 45%, transparent 70%)`,
    filter: "blur(20px)",
    position: "absolute",
    height: "32.5rem",
    right: "-12%",
    top: "-40%",
    width: "32.5rem",
  },
  kanji: {
    color: `color-mix(in srgb, ${scene.paper} 6%, transparent)`,
    fontFamily: sceneFont.display,
    fontSize: "clamp(12.5rem, 32vw, 26.25rem)",
    fontWeight: font.weightBold,
    lineHeight: 0.8,
    pointerEvents: "none",
    position: "absolute",
    transform: "translateY(-50%)",
    userSelect: "none",
    right: "clamp(-1.875rem, 2vw, 2.5rem)",
    top: "50%",
  },
  content: {
    gap: "1.375rem",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 2,
    maxWidth: "35rem",
  },
  title: {
    margin: 0,
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: "clamp(2.25rem, 5.4vw, 3.875rem)",
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.02,
    textWrap: "balance",
  },
  body: {
    margin: 0,
    color: `color-mix(in srgb, ${scene.paper} 82%, transparent)`,
    fontSize: text.xl,
    lineHeight: 1.5,
    textWrap: "pretty",
  },
  actions: {
    gap: "0.875rem",
    display: "flex",
    flexWrap: "wrap",
    marginTop: "0.375rem",
  },
})

export const LandingCta = () => (
  <section {...stylex.props(styles.band)}>
    <div {...stylex.props(styles.banner)}>
      <div {...stylex.props(styles.corona)} />
      <div aria-hidden {...stylex.props(styles.kanji)}>
        太
      </div>
      <div {...stylex.props(styles.content)}>
        <Eyebrow>{m.landing_cta_eyebrow()}</Eyebrow>
        <h2 {...stylex.props(styles.title)}>{m.landing_cta_title()}</h2>
        <p {...stylex.props(styles.body)}>{m.landing_cta_body()}</p>
        <div {...stylex.props(styles.actions)}>
          <SunLink to="/auth/sign-up">
            <HugeiconsIcon icon={Sun03Icon} size={20} />
            {m.landing_cta_primary()}
          </SunLink>
          <GhostAnchor href="#titles">{m.landing_cta_secondary()}</GhostAnchor>
        </div>
      </div>
    </div>
  </section>
)

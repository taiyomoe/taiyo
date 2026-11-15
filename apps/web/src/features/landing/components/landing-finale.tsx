import { Sun03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as stylex from "@stylexjs/stylex"
import { scene, sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { font, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { SunLink } from "@/components/buttons/sun-link"
import { CoverWall } from "@/features/landing/components/cover-wall"
import { Reveal } from "@/features/landing/components/reveal"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  band: {
    overflow: "hidden",
    paddingBlock: "clamp(6rem,14vw,10rem)",
    paddingInline: "1.5rem",
    alignItems: "center",
    backgroundColor: scene.nightDeep,
    display: "flex",
    justifyContent: "center",
    position: "relative",
    minHeight: "100vh",
  },
  wallDim: {
    inset: 0,
    opacity: 0.42,
    position: "absolute",
  },
  veil: {
    inset: 0,
    backgroundImage: `radial-gradient(50% 46% at 50% 50%, ${scene.nightDeep} 0%, color-mix(in srgb, ${scene.nightDeep} 82%, transparent) 45%, transparent 100%), linear-gradient(180deg, ${scene.night} 0%, transparent 22%, transparent 62%, ${scene.nightDeep} 96%)`,
    position: "absolute",
  },
  content: {
    gap: "1.5rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    textAlign: "center",
    zIndex: 2,
    maxWidth: "52rem",
  },
  title: {
    margin: 0,
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: "clamp(3rem, 8.5vw, 7.5rem)",
    fontWeight: font.weightBold,
    letterSpacing: "-0.04em",
    lineHeight: 0.94,
    textShadow: "0 8px 60px rgba(0,0,0,0.6)",
    textWrap: "balance",
  },
  body: {
    margin: 0,
    color: `color-mix(in srgb, ${scene.paper} 72%, transparent)`,
    fontSize: text.xl,
    lineHeight: 1.5,
    textWrap: "pretty",
    maxWidth: "34rem",
  },
  actions: {
    gap: "1.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "0.5rem",
  },
  signIn: {
    color: {
      default: `color-mix(in srgb, ${scene.paper} 66%, transparent)`,
      ":hover": `color-mix(in srgb, ${scene.paper} 86%, transparent)`,
    },
    fontWeight: font.weightBold,
    textDecorationLine: "none",
    transitionDuration: "150ms",
    transitionProperty: "color",
  },
})

export const LandingFinale = () => (
  <section id="titles" sx={styles.band}>
    <div sx={styles.wallDim}>
      <CoverWall />
    </div>
    <div sx={styles.veil} />
    <Reveal>
      <div sx={styles.content}>
        <h2 sx={styles.title}>{m.landing_cta_title()}</h2>
        <p sx={styles.body}>{m.landing_cta_body()}</p>
        <div sx={styles.actions}>
          <SunLink to="/auth/sign-up">
            <HugeiconsIcon icon={Sun03Icon} size={20} />
            {m.landing_cta_primary()}
          </SunLink>
          <Link to="/auth/sign-in" {...stylex.props(styles.signIn)}>
            {m.auth_sign_in()}
          </Link>
        </div>
      </div>
    </Reveal>
  </section>
)

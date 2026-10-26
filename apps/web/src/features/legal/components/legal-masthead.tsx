import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { font, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { scene, sceneFont } from "@/components/scene/scene.stylex"
import { Section } from "@/features/landing/components/section"

const styles = stylex.create({
  masthead: {
    backgroundImage: `radial-gradient(70% 100% at 50% 0%, color-mix(in srgb, ${scene.brand} 10%, transparent), transparent 70%)`,
    borderBottomColor: `color-mix(in srgb, ${scene.paper} 8%, transparent)`,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    paddingBottom: "clamp(2.5rem,5vw,3.75rem)",
    paddingTop: "clamp(8rem,14vw,11rem)",
  },
  eyebrow: {
    color: scene.goldLight,
    fontSize: "0.75rem",
    fontWeight: 800,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.04,
    marginTop: "0.75rem",
  },
  updated: {
    color: `color-mix(in srgb, ${scene.paper} 50%, transparent)`,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    marginTop: "1.25rem",
  },
  intro: {
    color: `color-mix(in srgb, ${scene.paper} 72%, transparent)`,
    fontSize: text.lg,
    lineHeight: 1.6,
    textWrap: "pretty",
    marginTop: "1.5rem",
    maxWidth: "44rem",
  },
})

type LegalMastheadProps = {
  eyebrow: string
  title: string
  updated: string
  intro: ReactNode
}

export const LegalMasthead = ({ eyebrow, title, updated, intro }: LegalMastheadProps) => (
  <header sx={styles.masthead}>
    <Section>
      <div sx={styles.eyebrow}>{eyebrow}</div>
      <h1 sx={styles.title}>{title}</h1>
      <p sx={styles.updated}>Last updated {updated}</p>
      <p sx={styles.intro}>{intro}</p>
    </Section>
  </header>
)

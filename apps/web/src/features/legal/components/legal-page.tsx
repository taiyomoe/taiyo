import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { breakpoints, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { scene, sceneFont } from "@/components/scene/scene.stylex"
import { LandingFooter } from "@/features/landing/components/landing-footer"
import { LandingNav } from "@/features/landing/components/landing-nav"
import { Section } from "@/features/landing/components/section"
import { LegalMasthead } from "@/features/legal/components/legal-masthead"
import { LegalToc } from "@/features/legal/components/legal-toc"

export type LegalSection = {
  id: string
  heading: string
  body: ReactNode
}

const styles = stylex.create({
  page: {
    backgroundColor: scene.night,
    color: scene.paper,
    overflowX: "hidden",
  },
  body: {
    gap: "clamp(2.5rem,5vw,4rem)",
    alignItems: "start",
    display: "grid",
    gridTemplateColumns: { default: "1fr", [breakpoints.lg]: "16rem 1fr" },
    paddingBottom: "clamp(5rem,9vw,7.5rem)",
    paddingTop: "clamp(2.5rem,5vw,3.75rem)",
  },
  prose: {
    gap: "clamp(2rem,4vw,2.75rem)",
    display: "flex",
    flexDirection: "column",
    maxWidth: "48rem",
  },
  section: {
    scrollMarginTop: "6.5rem",
  },
  heading: {
    margin: 0,
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: "clamp(1.375rem, 2.2vw, 1.75rem)",
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
    lineHeight: 1.2,
    marginBottom: "0.875rem",
  },
  contact: {
    padding: "clamp(1.5rem,3vw,2rem)",
    borderColor: `color-mix(in srgb, ${scene.gold} 22%, transparent)`,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: "1px",
    backgroundColor: `color-mix(in srgb, ${scene.gold} 6%, transparent)`,
  },
})

export const prose = stylex.create({
  p: {
    margin: 0,
    color: `color-mix(in srgb, ${scene.paper} 70%, transparent)`,
    fontSize: "1rem",
    lineHeight: 1.7,
    textWrap: "pretty",
    marginBottom: "0.875rem",
  },
  ul: {
    margin: 0,
    gap: "0.5rem",
    color: `color-mix(in srgb, ${scene.paper} 70%, transparent)`,
    display: "flex",
    flexDirection: "column",
    fontSize: "1rem",
    lineHeight: 1.65,
    marginBottom: "0.875rem",
    paddingLeft: "1.25rem",
  },
  strong: {
    color: scene.paper,
    fontWeight: 700,
  },
  a: {
    color: scene.goldLight,
    fontWeight: 600,
    textDecorationLine: { default: "none", ":hover": "underline" },
  },
  code: {
    borderRadius: radius.sm,
    paddingBlock: "0.125rem",
    paddingInline: "0.375rem",
    backgroundColor: `color-mix(in srgb, ${scene.paper} 8%, transparent)`,
    color: scene.paper,
    fontFamily: font.mono,
    fontSize: "0.875rem",
  },
})

type LegalPageProps = {
  eyebrow: string
  title: string
  updated: string
  intro: ReactNode
  sections: LegalSection[]
}

export const LegalPage = ({ eyebrow, title, updated, intro, sections }: LegalPageProps) => (
  <div sx={styles.page}>
    <LandingNav />
    <LegalMasthead eyebrow={eyebrow} intro={intro} title={title} updated={updated} />
    <Section>
      <div sx={styles.body}>
        <LegalToc sections={sections} />
        <div sx={styles.prose}>
          {sections.map((section) => (
            <section key={section.id} id={section.id} sx={styles.section}>
              <h2 sx={styles.heading}>{section.heading}</h2>
              {section.body}
            </section>
          ))}
        </div>
      </div>
    </Section>
    <LandingFooter />
  </div>
)

type LegalContactProps = {
  children: ReactNode
}

export const LegalContact = ({ children }: LegalContactProps) => (
  <div sx={styles.contact}>{children}</div>
)

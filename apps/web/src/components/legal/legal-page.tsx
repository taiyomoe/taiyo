import * as stylex from "@stylexjs/stylex"
import { font, radius, text } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ReactNode } from "react"

import { Section } from "@/components/landing/landing-atoms"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingNav } from "@/components/landing/landing-nav"
import { scene, sceneFont } from "@/components/scene/scene.stylex"

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
  body: {
    gap: "clamp(2.5rem,5vw,4rem)",
    alignItems: "start",
    display: "grid",
    gridTemplateColumns: { default: "1fr", "@media (width >= 64rem)": "16rem 1fr" },
    paddingBottom: "clamp(5rem,9vw,7.5rem)",
    paddingTop: "clamp(2.5rem,5vw,3.75rem)",
  },
  // Sticks beside the prose on desktop; above it, unpinned, on narrow screens.
  toc: {
    position: { default: "static", "@media (width >= 64rem)": "sticky" },
    top: "6.5rem",
  },
  tocLabel: {
    color: `color-mix(in srgb, ${scene.paper} 40%, transparent)`,
    fontSize: "0.6875rem",
    fontWeight: 800,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    marginBottom: "0.875rem",
  },
  tocList: {
    margin: 0,
    padding: 0,
    gap: "0.4375rem",
    display: "flex",
    flexDirection: "column",
    listStyleType: "none",
  },
  tocLink: {
    color: {
      default: `color-mix(in srgb, ${scene.paper} 58%, transparent)`,
      ":hover": scene.goldLight,
    },
    fontSize: "0.875rem",
    lineHeight: 1.45,
    textDecorationLine: "none",
    transitionDuration: "150ms",
    transitionProperty: "color",
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

/** Shared prose styles, so the three legal pages cannot drift apart. */
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

export const LegalPage = ({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string
  title: string
  updated: string
  intro: ReactNode
  sections: LegalSection[]
}) => (
  <div sx={styles.page}>
    <LandingNav />
    <header sx={styles.masthead}>
      <Section>
        <div sx={styles.eyebrow}>{eyebrow}</div>
        <h1 sx={styles.title}>{title}</h1>
        <p sx={styles.updated}>Last updated {updated}</p>
        <p sx={styles.intro}>{intro}</p>
      </Section>
    </header>
    <Section>
      <div sx={styles.body}>
        <nav sx={styles.toc} aria-label="On this page">
          <div sx={styles.tocLabel}>On this page</div>
          <ol sx={styles.tocList}>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} sx={styles.tocLink}>
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
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

/** The bordered "how to reach us" block each policy closes on. */
export const LegalContact = ({ children }: { children: ReactNode }) => (
  <div sx={styles.contact}>{children}</div>
)

import * as stylex from "@stylexjs/stylex"
import { scene, sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { ReasonRow } from "@/features/landing/components/reason-row"
import { Reveal } from "@/features/landing/components/reveal"
import { Section } from "@/features/landing/components/section"
import { REASONS } from "@/features/landing/lib/landing-data"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  band: {
    backgroundColor: scene.night,
    paddingBottom: "clamp(5rem,11vw,9rem)",
    paddingTop: "clamp(4rem,9vw,7rem)",
  },
  head: {
    gap: "1.5rem",
    alignItems: { default: "flex-start", [breakpoints.md]: "flex-end" },
    display: "flex",
    flexDirection: { default: "column", [breakpoints.md]: "row" },
    justifyContent: "space-between",
    marginBottom: "clamp(2.5rem,6vw,4.5rem)",
  },
  label: {
    color: scene.gold,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
  },
  title: {
    margin: 0,
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: "clamp(2.25rem, 5vw, 4rem)",
    fontWeight: font.weightBold,
    letterSpacing: "-0.03em",
    lineHeight: 1,
    textWrap: "balance",
    maxWidth: "44rem",
  },
  list: {
    borderBottomColor: `color-mix(in srgb, ${scene.paper} 10%, transparent)`,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
  },
})

export const LandingReasons = () => (
  <section id="reasons" sx={styles.band}>
    <Section>
      <Reveal>
        <div sx={styles.head}>
          <h2 sx={styles.title}>{m.landing_flaws_title()}</h2>
          <span sx={styles.label}>{m.landing_index_label()}</span>
        </div>
      </Reveal>
      <div sx={styles.list}>
        {REASONS.map((flaw, i) => (
          <Reveal key={flaw.id} delay={i * 60}>
            <ReasonRow number={i + 1} title={flaw.title()} body={flaw.body()} />
          </Reveal>
        ))}
      </div>
    </Section>
  </section>
)

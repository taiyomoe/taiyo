import * as stylex from "@stylexjs/stylex"
import { font } from "@taiyomoe/ui/styles/tokens.stylex"

import { Reveal, Section } from "@/components/landing/landing-atoms"
import { STATS } from "@/components/landing/landing-data"
import { scene, sceneFont } from "@/components/scene/scene.stylex"

const styles = stylex.create({
  band: {
    borderBlockStyle: "solid",
    paddingBlock: "clamp(3.375rem,7vw,5.25rem)",
    backgroundColor: scene.nightRaised,
    borderBlockColor: `color-mix(in srgb, ${scene.paper} 7%, transparent)`,
    borderBlockWidth: "1px",
  },
  grid: {
    columnGap: "1.25rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(11.25rem, 1fr))",
    rowGap: "2.5rem",
    textAlign: "center",
  },
  // Gradient-clipped numerals: the figure itself becomes a sliver of sunlight.
  value: {
    backgroundClip: "text",
    backgroundImage: `linear-gradient(180deg, ${scene.goldPale}, ${scene.gold})`,
    color: "transparent",
    fontFamily: sceneFont.display,
    fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
    fontWeight: font.weightBold,
    lineHeight: 1,
  },
  label: {
    color: `color-mix(in srgb, ${scene.paper} 55%, transparent)`,
    fontSize: "0.875rem",
    marginTop: "0.625rem",
  },
})

export const LandingStats = () => (
  <section sx={styles.band}>
    <Section>
      <div sx={styles.grid}>
        {STATS.map((stat, i) => (
          <Reveal key={stat.value} delay={i * 70}>
            <div sx={styles.value}>{stat.value}</div>
            <div sx={styles.label}>{stat.label()}</div>
          </Reveal>
        ))}
      </div>
    </Section>
  </section>
)

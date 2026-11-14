import * as stylex from "@stylexjs/stylex"
import { scene, sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { Stars } from "@/components/scene/stars"
import { Reveal } from "@/features/landing/components/reveal"
import { Section } from "@/features/landing/components/section"
import { VelocityRow } from "@/features/landing/components/velocity-row"
import { REVIEWS } from "@/features/landing/lib/landing-data"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  band: {
    overflow: "hidden",
    backgroundColor: scene.night,
    paddingBottom: "clamp(5rem,11vw,9rem)",
  },
  head: {
    gap: "1.25rem",
    alignItems: { default: "flex-start", [breakpoints.md]: "flex-end" },
    display: "flex",
    flexDirection: { default: "column", [breakpoints.md]: "row" },
    justifyContent: "space-between",
    marginBottom: "clamp(2.5rem,5vw,4rem)",
  },
  title: {
    margin: 0,
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: "clamp(2.25rem, 5vw, 4rem)",
    fontWeight: font.weightBold,
    letterSpacing: "-0.03em",
    lineHeight: 1,
  },
  rating: {
    gap: "0.75rem",
    alignItems: "center",
    color: `color-mix(in srgb, ${scene.paper} 55%, transparent)`,
    display: "flex",
    fontFamily: font.mono,
    fontSize: "0.8125rem",
  },
  rows: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    maskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
  },
})

export const LandingReviews = () => {
  const items = REVIEWS.map((review) => ({ quote: review.quote(), who: review.who() }))

  return (
    <section id="reviews" sx={styles.band}>
      <Section>
        <Reveal>
          <div sx={styles.head}>
            <h2 sx={styles.title}>{m.landing_reviews_title()}</h2>
            <div sx={styles.rating}>
              <Stars filled={1} size={18} />
              {m.landing_reviews_rating({ count: REVIEWS.length })}
            </div>
          </div>
        </Reveal>
      </Section>
      <div sx={styles.rows}>
        <VelocityRow items={items.slice(0, 5)} speed={60} />
        <VelocityRow items={items.slice(5)} speed={-45} dim />
      </div>
    </section>
  )
}

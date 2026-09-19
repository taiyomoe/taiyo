import * as stylex from "@stylexjs/stylex"
import { font, radius, text } from "@taiyomoe/ui/styles/tokens.stylex"

import { Reveal, Section, SectionHead } from "@/components/landing/landing-atoms"
import { REVIEWS } from "@/components/landing/landing-data"
import { Stars } from "@/components/scene/stars"
import { scene, sceneFont } from "@/components/scene/scene.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  band: {
    paddingBlock: "clamp(5rem,11vw,8.75rem)",
    backgroundColor: scene.night,
  },
  // A masonry column flow rather than a grid: the quotes are wildly uneven in
  // length, and a grid would leave a ragged band of empty card under each row.
  columns: {
    columnGap: "1.25rem",
    columnWidth: "21.25rem",
    marginTop: "3.375rem",
  },
  item: {
    breakInside: "avoid",
    marginBottom: "1.25rem",
  },
  card: {
    borderColor: `color-mix(in srgb, ${scene.paper} 10%, transparent)`,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: "1px",
    backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${scene.paper} 5%, transparent), color-mix(in srgb, ${scene.paper} 2%, transparent))`,
    paddingBottom: "1.5rem",
    paddingLeft: "1.625rem",
    paddingRight: "1.625rem",
    paddingTop: "1.625rem",
  },
  quote: {
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: text.xl,
    fontStyle: "italic",
    fontWeight: font.weightBold,
    lineHeight: 1.32,
    textWrap: "pretty",
    marginBottom: "1.25rem",
    marginLeft: "0",
    marginRight: "0",
    marginTop: "0.9375rem",
  },
  author: {
    gap: "0.6875rem",
    alignItems: "center",
    display: "flex",
  },
  avatar: {
    borderRadius: "50%",
    alignItems: "center",
    backgroundImage: `linear-gradient(140deg, ${scene.brand}, ${scene.gold})`,
    color: scene.ink,
    display: "flex",
    flexShrink: 0,
    fontFamily: sceneFont.display,
    fontSize: "1rem",
    fontWeight: font.weightBold,
    justifyContent: "center",
    height: "2.375rem",
    width: "2.375rem",
  },
  who: {
    color: scene.paper,
    fontSize: "0.875rem",
    fontWeight: font.weightBold,
  },
  role: {
    color: `color-mix(in srgb, ${scene.paper} 50%, transparent)`,
    fontSize: "0.75rem",
  },
})

export const LandingReviews = () => (
  <section id="reviews" sx={styles.band}>
    <Section>
      <Reveal>
        <SectionHead
          centered
          eyebrow={m.landing_reviews_eyebrow()}
          title={m.landing_reviews_title()}
          sub={m.landing_reviews_subtitle()}
        />
      </Reveal>
      <div sx={styles.columns}>
        {REVIEWS.map((review, i) => {
          const who = review.who()

          return (
            <div key={who} sx={styles.item}>
              <Reveal delay={(i % 3) * 80}>
                <div sx={styles.card}>
                  <Stars filled={1} />
                  <p sx={styles.quote}>“{review.quote()}”</p>
                  <div sx={styles.author}>
                    <span sx={styles.avatar}>{who.charAt(0).toUpperCase()}</span>
                    <div>
                      <div sx={styles.who}>{who}</div>
                      <div sx={styles.role}>{review.role()}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          )
        })}
      </div>
    </Section>
  </section>
)

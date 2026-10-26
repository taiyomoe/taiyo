import * as stylex from "@stylexjs/stylex"
import { scene } from "@/components/scene/scene.stylex"
import { Reveal } from "@/features/landing/components/reveal"
import { ReviewCard } from "@/features/landing/components/review-card"
import { Section } from "@/features/landing/components/section"
import { SectionHead } from "@/features/landing/components/section-head"
import { REVIEWS } from "@/features/landing/lib/landing-data"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  band: {
    paddingBlock: "clamp(5rem,11vw,8.75rem)",
    backgroundColor: scene.night,
  },
  columns: {
    columnGap: "1.25rem",
    columnWidth: "21.25rem",
    marginTop: "3.375rem",
  },
  item: {
    breakInside: "avoid",
    marginBottom: "1.25rem",
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
                <ReviewCard quote={review.quote()} role={review.role()} who={who} />
              </Reveal>
            </div>
          )
        })}
      </div>
    </Section>
  </section>
)

import * as stylex from "@stylexjs/stylex"
import { scene } from "@/components/scene/scene.stylex"
import { LandingCta } from "@/features/landing/components/landing-cta"
import { LandingFlaws } from "@/features/landing/components/landing-flaws"
import { LandingFooter } from "@/features/landing/components/landing-footer"
import { LandingHero } from "@/features/landing/components/landing-hero"
import { LandingMarquee } from "@/features/landing/components/landing-marquee"
import { LandingNav } from "@/features/landing/components/landing-nav"
import { LandingReviews } from "@/features/landing/components/landing-reviews"
import { LandingStats } from "@/features/landing/components/landing-stats"

const styles = stylex.create({
  page: {
    backgroundColor: scene.night,
    color: scene.paper,
    overflowX: "hidden",
  },
})

export function LandingPage() {
  return (
    <div data-landing sx={styles.page}>
      <LandingNav />
      <LandingHero />
      <LandingMarquee />
      <LandingFlaws />
      <LandingStats />
      <LandingReviews />
      <LandingCta />
      <LandingFooter />
    </div>
  )
}

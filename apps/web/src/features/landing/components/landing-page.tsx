import * as stylex from "@stylexjs/stylex"
import { scene } from "@taiyomoe/ui/styles/scene.stylex"
import { LandingFinale } from "@/features/landing/components/landing-finale"
import { LandingFooter } from "@/features/landing/components/landing-footer"
import { LandingHero } from "@/features/landing/components/landing-hero"
import { LandingNav } from "@/features/landing/components/landing-nav"
import { LandingReasons } from "@/features/landing/components/landing-reasons"
import { LandingReviews } from "@/features/landing/components/landing-reviews"

const styles = stylex.create({
  page: {
    backgroundColor: scene.night,
    color: scene.paper,
    overflowX: "clip",
  },
})

export function LandingPage() {
  return (
    <div data-landing sx={styles.page}>
      <LandingNav />
      <LandingHero />
      <LandingReasons />
      <LandingReviews />
      <LandingFinale />
      <LandingFooter />
    </div>
  )
}

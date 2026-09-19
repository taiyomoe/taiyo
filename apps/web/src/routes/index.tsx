import * as stylex from "@stylexjs/stylex"
import { createFileRoute } from "@tanstack/react-router"

import { LandingCta } from "@/components/landing/landing-cta"
import { LandingFlaws } from "@/components/landing/landing-flaws"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingMarquee } from "@/components/landing/landing-marquee"
import { LandingNav } from "@/components/landing/landing-nav"
import { LandingReviews } from "@/components/landing/landing-reviews"
import { LandingStats } from "@/components/landing/landing-stats"
import { scene } from "@/components/scene/scene.stylex"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: m.landing_meta_title() },
      { name: "description", content: m.landing_meta_description() },
    ],
  }),
  component: Home,
})

const styles = stylex.create({
  page: {
    backgroundColor: scene.night,
    color: scene.paper,
    overflowX: "hidden",
  },
})

/** `data-landing` is the hook the reduced-motion block in styles.css keys off. */
function Home() {
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

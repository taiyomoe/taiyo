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
    // The scene is always night, in both themes — the sections paint their own
    // ground, and this catches overscroll and any sub-pixel seam between them.
    color: scene.paper,
    overflowX: "hidden",
  },
})

/**
 * The marketing page. `data-landing` is what the reduced-motion block in
 * styles.css keys off, so the sun, the embers and the cover strip all stop
 * together rather than one at a time.
 */
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

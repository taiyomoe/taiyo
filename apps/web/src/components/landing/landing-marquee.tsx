import * as stylex from "@stylexjs/stylex"
import { font } from "@taiyomoe/ui/styles/tokens.stylex"

import { CoverArt } from "@/components/landing/cover-art"
import { TITLES } from "@/components/landing/landing-data"
import { Stars } from "@/components/scene/stars"
import { scene } from "@/components/scene/scene.stylex"

// Rendered twice so the -50% translate lands the copy exactly where the
// original started — that is what makes the loop seamless.
const STRIP = [...TITLES, ...TITLES]
const styles = stylex.create({
  band: {
    overflow: "hidden",
    backgroundColor: scene.night,
    position: "relative",
    paddingBottom: "0.625rem",
    paddingTop: "2.5rem",
  },
  // Fades the strip into the page background at both ends instead of letting
  // covers get chopped off at the viewport edge.
  fade: {
    inset: 0,
    backgroundImage: `linear-gradient(90deg, ${scene.night} 0%, transparent 12%, transparent 88%, ${scene.night} 100%)`,
    pointerEvents: "none",
    position: "absolute",
    zIndex: 2,
  },
  track: {
    gap: "1.125rem",
    display: "flex",
    width: "max-content",
  },
  slot: {
    flexShrink: 0,
    width: "9.375rem",
  },
  scrim: {
    inset: 0,
    backgroundImage: "linear-gradient(180deg, transparent 55%, rgba(8,4,2,0.85))",
    position: "absolute",
  },
  metaLine: {
    color: `color-mix(in srgb, ${scene.paper} 70%, transparent)`,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    marginTop: "0.25rem",
  },
})

export const LandingMarquee = () => {
  const trackProps = stylex.props(styles.track)

  return (
    <section id="titles" sx={styles.band}>
      <div sx={styles.fade} />
      <div
        className={trackProps.className}
        style={{ ...trackProps.style, animation: "scene-marquee 48s linear infinite" }}
      >
        {STRIP.map((title, i) => (
          <div key={`${title.id}-${i}`} sx={styles.slot}>
            <CoverArt
              title={title.title}
              style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
              footer={
                <div>
                  <Stars filled={Math.round(title.rating)} size={12} />
                  <div sx={styles.metaLine}>
                    {title.chapters} ch · {title.tag}
                  </div>
                </div>
              }
            >
              <div sx={styles.scrim} />
            </CoverArt>
          </div>
        ))}
      </div>
    </section>
  )
}

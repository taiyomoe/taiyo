import * as stylex from "@stylexjs/stylex"
import { scene, sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { font } from "@taiyomoe/ui/styles/tokens.stylex"
import { useRef } from "react"
import { useVelocityMarquee } from "@/features/landing/hooks/use-velocity-marquee"

const styles = stylex.create({
  viewport: {
    overflow: "hidden",
    paddingBlock: "0.75rem",
  },
  track: {
    display: "flex",
    willChange: "transform",
    width: "max-content",
  },
  copy: {
    display: "flex",
  },
  item: {
    gap: "clamp(1.5rem,3vw,3rem)",
    alignItems: "center",
    display: "flex",
    whiteSpace: "nowrap",
    paddingRight: "clamp(1.5rem,3vw,3rem)",
  },
  quote: {
    fontFamily: sceneFont.display,
    fontSize: "clamp(2.25rem, 5.6vw, 5rem)",
    fontStyle: "italic",
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
  },
  bright: {
    color: scene.paper,
  },
  dim: {
    color: `color-mix(in srgb, ${scene.paper} 26%, transparent)`,
  },
  who: {
    color: `color-mix(in srgb, ${scene.paper} 45%, transparent)`,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
  },
  sun: {
    borderRadius: "50%",
    backgroundImage: `radial-gradient(circle at 40% 35%, ${scene.goldPale}, ${scene.gold} 45%, ${scene.brand})`,
    boxShadow: `0 0 24px color-mix(in srgb, ${scene.gold} 70%, transparent)`,
    flexShrink: 0,
    height: "0.875rem",
    width: "0.875rem",
  },
})

export const VelocityRow = ({
  items,
  speed,
  dim = false,
}: {
  items: Array<{ quote: string; who: string }>
  speed: number
  dim?: boolean
}) => {
  const trackRef = useRef<HTMLDivElement>(null)

  useVelocityMarquee(trackRef, { speed })

  return (
    <div sx={styles.viewport}>
      <div ref={trackRef} sx={styles.track}>
        {["a", "b"].map((copy) => (
          <div key={copy} aria-hidden={copy === "b"} sx={styles.copy}>
            {items.map((item) => (
              <div key={item.who} sx={styles.item}>
                <span sx={[styles.quote, dim ? styles.dim : styles.bright]}>“{item.quote}”</span>
                <span sx={styles.who}>{item.who}</span>
                <span sx={styles.sun} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

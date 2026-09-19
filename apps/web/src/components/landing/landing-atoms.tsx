import * as stylex from "@stylexjs/stylex"
import { font, radius, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { type ReactNode, useEffect, useRef, useState } from "react"

import { scene, sceneFont } from "@/components/scene/scene.stylex"

const styles = stylex.create({
  // The page's one content measure. Every band is full-bleed; only the text
  // inside it is constrained, so the section backgrounds still run edge to edge.
  section: {
    marginInline: "auto",
    paddingInline: "clamp(1.25rem,4vw,2.5rem)",
    maxWidth: "75rem",
    width: "100%",
  },
  eyebrow: {
    borderColor: `color-mix(in srgb, ${scene.gold} 22%, transparent)`,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: "1px",
    gap: "0.5625rem",
    paddingBlock: "0.4375rem",
    paddingInline: "0.9375rem",
    alignItems: "center",
    backgroundColor: `color-mix(in srgb, ${scene.gold} 8%, transparent)`,
    display: "inline-flex",
  },
  eyebrowCentered: {
    alignSelf: "center",
  },
  eyebrowDot: {
    borderRadius: "50%",
    backgroundColor: scene.gold,
    boxShadow: `0 0 10px ${scene.gold}`,
    height: "0.375rem",
    width: "0.375rem",
  },
  eyebrowLabel: {
    color: scene.goldLight,
    fontSize: "0.75rem",
    fontWeight: 800,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  },
  stars: {
    gap: "0.1875rem",
    display: "inline-flex",
  },
  head: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    maxWidth: "38.75rem",
  },
  headCentered: {
    marginInline: "auto",
    alignItems: "center",
    textAlign: "center",
    maxWidth: "45rem",
  },
  headTitle: {
    margin: 0,
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: "clamp(2rem, 4.4vw, 3.25rem)",
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.04,
    textWrap: "balance",
  },
  headSub: {
    margin: 0,
    color: `color-mix(in srgb, ${scene.paper} 62%, transparent)`,
    fontSize: text.lg,
    lineHeight: 1.55,
    textWrap: "pretty",
  },
  reveal: {
    transitionProperty: "opacity, transform",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
})

export const Section = ({ children }: { children: ReactNode }) => (
  <div sx={styles.section}>{children}</div>
)

/** Letter-spaced caps with a glowing gold dot — the page's section marker. */
export const Eyebrow = ({
  children,
  centered = false,
}: {
  children: ReactNode
  centered?: boolean
}) => (
  <div sx={[styles.eyebrow, centered && styles.eyebrowCentered]}>
    <span sx={styles.eyebrowDot} />
    <span sx={styles.eyebrowLabel}>{children}</span>
  </div>
)

/**
 * Rating stars. Hand-drawn rather than pulled from the icon set: hugeicons'
 * free tier is stroke-only, and a rating needs a SOLID star to read the
 * filled/empty split at 12–16px.
 */
export const Stars = ({ filled, size = 15 }: { filled: number; size?: number }) => (
  <span sx={styles.stars} aria-hidden>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={i < filled ? scene.gold : `color-mix(in srgb, ${scene.paper} 16%, transparent)`}
      >
        <path d="M12 2.6l2.7 5.9 6.4.7-4.8 4.3 1.3 6.3L12 16.9 6.2 20.1l1.3-6.3L2.7 9.2l6.4-.7L12 2.6z" />
      </svg>
    ))}
  </span>
)

export const SectionHead = ({
  eyebrow,
  title,
  sub,
  centered = false,
}: {
  eyebrow: string
  title: string
  sub?: string
  centered?: boolean
}) => (
  <div sx={[styles.head, centered && styles.headCentered]}>
    <Eyebrow centered={centered}>{eyebrow}</Eyebrow>
    <h2 sx={styles.headTitle}>{title}</h2>
    {sub ? <p sx={styles.headSub}>{sub}</p> : null}
  </div>
)

/**
 * Fades content up as it scrolls into view. The timeout is a deliberate safety
 * net: if the observer never fires — no scroll, a reduced-motion browser, a
 * prerender — the content reveals itself anyway rather than staying invisible.
 */
export const Reveal = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)
  const revealProps = stylex.props(styles.reveal)

  useEffect(() => {
    const el = ref.current

    if (!el) {
      return
    }

    // No observer (very old browser, some test runners): reveal on the next
    // tick rather than synchronously, which would cascade an extra render.
    if (typeof IntersectionObserver === "undefined") {
      const immediate = setTimeout(() => setSeen(true), 0)

      return () => clearTimeout(immediate)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSeen(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    )

    observer.observe(el)

    const fallback = setTimeout(() => setSeen(true), 1600)

    return () => {
      observer.disconnect()
      clearTimeout(fallback)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={revealProps.className}
      style={{
        ...revealProps.style,
        opacity: seen ? 1 : 0,
        transform: seen ? "none" : "translateY(28px)",
        transitionDuration: "700ms",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

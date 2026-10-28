import { QuoteDownIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as stylex from "@stylexjs/stylex"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useEffect, useState } from "react"
import { scene } from "@/components/scene/scene.stylex"
import { AuthCitation } from "@/features/auth/components/scene/auth-citation"
import { m } from "@/paraglide/messages"

type Citation = {
  quote: () => string
  role: () => string
  rating: number
  who: string
}

const CITATIONS = [
  { quote: m.auth_review_1, role: m.auth_review_1_role, rating: 1, who: "zero_stars_given" },
  { quote: m.auth_review_2, role: m.auth_review_2_role, rating: 1, who: "refund_pls" },
  { quote: m.auth_review_3, role: m.auth_review_3_role, rating: 1, who: "deeply_unimpressed" },
  { quote: m.auth_review_4, role: m.auth_review_4_role, rating: 1, who: "filed_a_complaint" },
  { quote: m.auth_review_5, role: m.auth_review_5_role, rating: 1, who: "regret_incarnate" },
  { quote: m.auth_review_6, role: m.auth_review_6_role, rating: 1, who: "the_disappointment" },
] satisfies Citation[]
const styles = stylex.create({
  root: {
    position: "relative",
    zIndex: 3,
    maxWidth: "32.5rem",
  },
  scrim: {
    background:
      "radial-gradient(58% 72% at 32% 52%, rgba(8,4,2,0.82), rgba(8,4,2,0.45) 55%, transparent 78%)",
    insetBlock: "-3rem",
    insetInline: "-4.5rem",
    filter: "blur(10px)",
    position: "absolute",
    zIndex: -1,
  },
  badge: {
    borderColor: `color-mix(in srgb, ${scene.paper} 10%, transparent)`,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.5rem",
    paddingBlock: "0.375rem",
    paddingInline: "0.8125rem",
    alignItems: "center",
    backdropFilter: "blur(6px)",
    backgroundColor: `color-mix(in srgb, ${scene.paper} 6%, transparent)`,
    color: scene.goldLight,
    display: "inline-flex",
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginBottom: "1.375rem",
  },
  badgeIcon: {
    height: "0.875rem",
    width: "0.875rem",
  },
  dots: {
    gap: "0.4375rem",
    display: "flex",
    marginTop: "1.625rem",
  },
  dot: {
    padding: 0,
    borderRadius: radius.full,
    borderStyle: "none",
    backgroundColor: `color-mix(in srgb, ${scene.paper} 22%, transparent)`,
    cursor: "pointer",
    transitionDuration: "200ms",
    transitionProperty: "width",
    height: "0.5rem",
    width: "0.5rem",
  },
  dotCurrent: {
    backgroundImage: `linear-gradient(90deg, ${scene.brand}, ${scene.gold})`,
    width: "1.625rem",
  },
})

export const AuthCitations = () => {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) {
      return undefined
    }

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % CITATIONS.length)
    }, 4800)

    return () => {
      clearInterval(timer)
    }
  }, [paused])

  const citation = CITATIONS[index]

  if (!citation) {
    return null
  }

  return (
    <div
      onMouseEnter={() => {
        setPaused(true)
      }}
      onMouseLeave={() => {
        setPaused(false)
      }}
      sx={styles.root}
    >
      <div sx={styles.scrim} />
      <div sx={styles.badge}>
        <HugeiconsIcon icon={QuoteDownIcon} {...stylex.props(styles.badgeIcon)} />
        {m.auth_reviews_badge()}
      </div>
      <AuthCitation
        key={index}
        quote={citation.quote()}
        rating={citation.rating}
        role={citation.role()}
        who={citation.who}
      />
      <div sx={styles.dots}>
        {CITATIONS.map((item, dot) => (
          <button
            key={item.who}
            type="button"
            aria-label={m.auth_review_aria({ number: dot + 1 })}
            onClick={() => {
              setIndex(dot)
            }}
            sx={[styles.dot, dot === index && styles.dotCurrent]}
          />
        ))}
      </div>
    </div>
  )
}

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
    marginBlock: "auto",
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

import * as stylex from "@stylexjs/stylex"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import { CarouselDots } from "@/components/carousel-dots/carousel-dots"
import { AuthCitation } from "@/features/auth/components/scene/auth-citation"
import { useDocumentHidden } from "@/features/home/hooks/use-document-hidden"
import { usePrefersReducedMotion } from "@/features/home/hooks/use-prefers-reduced-motion"
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
    marginLeft: { default: "-0.1875rem", [breakpoints.md]: "-0.25rem" },
    marginTop: "1.125rem",
  },
})

export const AuthCitations = () => {
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const hidden = useDocumentHidden()
  const citation = CITATIONS[index]

  if (!citation) {
    return null
  }

  return (
    <div
      onMouseEnter={() => {
        setHovered(true)
      }}
      onMouseLeave={() => {
        setHovered(false)
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
      <CarouselDots
        autoplay={!reducedMotion}
        items={CITATIONS.map((item, dot) => ({
          key: item.who,
          label: m.auth_review_aria({ number: dot + 1 }),
        }))}
        onComplete={() => {
          setIndex((current) => (current + 1) % CITATIONS.length)
        }}
        onSelect={setIndex}
        paused={hovered || hidden}
        reducedMotion={reducedMotion}
        selected={index}
        sx={styles.dots}
        variant="sun"
      />
    </div>
  )
}

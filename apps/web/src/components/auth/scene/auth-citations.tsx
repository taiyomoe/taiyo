import { AuthCitationsRating } from "@/components/auth/scene/auth-citations-rating"
import { m } from "@/paraglide/messages"
import { cn } from "@taiyomoe/ui/utils/cn"
import { Quote } from "lucide-react"
import { useEffect, useState } from "react"

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

export const AuthCitations = () => {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) {
      return
    }

    const timer = setInterval(() => setIndex((prev) => (prev + 1) % CITATIONS.length), 4800)

    return () => clearInterval(timer)
  }, [paused])

  const citation = CITATIONS[index]

  if (!citation) {
    return null
  }

  return (
    <div
      className="relative z-3 max-w-130"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="absolute -inset-x-18 -inset-y-12 z-[-1]"
        style={{
          background:
            "radial-gradient(58% 72% at 32% 52%, rgba(8,4,2,0.82), rgba(8,4,2,0.45) 55%, transparent 78%)",
          filter: "blur(10px)",
        }}
      />
      <div className="mb-5.5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3.25 py-1.5 text-xs font-bold tracking-[0.04em] text-[#FFC94D] uppercase backdrop-blur-[6px]">
        <Quote className="size-3.5" />
        {m.auth_reviews_badge()}
      </div>
      <div key={index} className="min-h-47" style={{ textShadow: "0 2px 18px rgba(10,5,3,0.7)" }}>
        <AuthCitationsRating count={citation.rating} />
        <p className="mt-4 mb-5.5 font-heading text-[clamp(24px,2.4vw,34px)] leading-[1.22] font-bold text-balance italic">
          {`“${citation.quote()}”`}
        </p>
        <div className="flex items-center gap-3">
          <span
            className="inline-flex size-10.5 shrink-0 items-center justify-center rounded-full font-heading text-lg font-bold text-[#2a1208]"
            style={{ background: "linear-gradient(140deg,#F2452D,#FFB820)" }}
          >
            {citation.who.charAt(0).toUpperCase()}
          </span>
          <div className="leading-tight">
            <div className="font-bold">{citation.who}</div>
            <div className="text-[13px] text-white/55">{citation.role()}</div>
          </div>
        </div>
      </div>
      <div className="mt-6.5 flex gap-1.75">
        {CITATIONS.map((item, dot) => (
          <button
            key={item.who}
            type="button"
            aria-label={m.auth_review_aria({ number: dot + 1 })}
            onClick={() => setIndex(dot)}
            className={cn(
              "h-2 rounded-full transition-[width]",
              dot === index ? "w-6.5" : "w-2 bg-white/22",
            )}
            style={
              dot === index ? { background: "linear-gradient(90deg,#F2452D,#FFB820)" } : undefined
            }
          />
        ))}
      </div>
    </div>
  )
}

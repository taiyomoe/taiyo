import { QuoteDownIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as stylex from "@stylexjs/stylex"
import { TaiyoLogoLockup } from "@taiyomoe/ui/components/logos/taiyo-logo-lockup"
import { font, radius, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { SignInForm } from "@/components/auth/sign-in-form"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { Animated } from "@/components/scene/animated"
import { Embers } from "@/components/scene/embers"
import { scene, sceneFont } from "@/components/scene/scene.stylex"
import { Stars } from "@/components/scene/stars"
import { SunRays } from "@/components/scene/sun-rays"
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
const TABS = [
  { type: "sign-up", label: m.auth_sign_up, to: "/auth/sign-up" },
  { type: "sign-in", label: m.auth_sign_in, to: "/auth/sign-in" },
] as const
const LG = "@media (width >= 64rem)"
const styles = stylex.create({
  screen: {
    overflow: "hidden",
    backgroundColor: scene.night,
    color: scene.paper,
    display: "grid",
    gridTemplateColumns: { [LG]: "1.05fr 0.95fr", default: null },
    height: "100svh",
  },
  panel: {
    paddingBlock: "2rem",
    paddingInline: "clamp(28px,5vw,76px)",
    backgroundImage: "linear-gradient(180deg, #1b0f0a, #150c08)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    scrollbarWidth: "none",
    height: "100svh",
    overflowY: "auto",
  },
  column: {
    marginInline: "auto",
    maxWidth: "26.875rem",
    width: "100%",
  },
  tabs: {
    padding: "0.25rem",
    borderColor: `color-mix(in srgb, ${scene.paper} 8%, transparent)`,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.25rem",
    backgroundColor: `color-mix(in srgb, ${scene.paper} 6%, transparent)`,
    display: "inline-flex",
  },
  tab: {
    borderRadius: radius.full,
    borderStyle: "none",
    paddingBlock: "0.5rem",
    paddingInline: "1.25rem",
    backgroundColor: "transparent",
    color: {
      default: `color-mix(in srgb, ${scene.paper} 70%, transparent)`,
      ":hover": scene.paper,
    },
    cursor: "pointer",
    fontFamily: font.sans,
    fontSize: "0.875rem",
    fontWeight: 700,
    textDecorationLine: "none",
    transitionDuration: "150ms",
    transitionProperty: "background-color, color",
  },
  // Applied after `tab` rather than through a `[data-active]` condition:
  // a later argument to stylex.props() always wins, whereas an attribute
  // condition and the `:hover` above could resolve either way.
  tabActive: {
    backgroundColor: scene.paper,
    color: "#1b0f0a",
  },
})
const sceneStyles = stylex.create({
  root: {
    overflow: "hidden",
    paddingBlock: "2.75rem",
    paddingInline: "3.5rem",
    backgroundColor: scene.night,
    display: { [LG]: "flex", default: "none" },
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
  },
  logo: {
    opacity: { default: 1, ":hover": 0.8 },
    position: "relative",
    transitionDuration: "150ms",
    transitionProperty: "opacity",
    zIndex: 3,
    width: "fit-content",
  },
  lockup: {
    gap: "0.75rem",
    fontFamily: sceneFont.display,
    fontSize: "26px",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  tagline: {
    color: `color-mix(in srgb, ${scene.paper} 40%, transparent)`,
    fontFamily: font.mono,
    fontSize: "13px",
    position: "relative",
    zIndex: 3,
  },
})
const sunStyles = stylex.create({
  root: {
    inset: 0,
    overflow: "hidden",
    position: "absolute",
  },
  aurora: {
    background: `radial-gradient(60% 80% at 50% 100%, color-mix(in srgb, ${scene.brand} 42%, transparent), transparent 70%)`,
    inset: "-20% -20% 30% -20%",
    filter: "blur(20px)",
    position: "absolute",
  },
  system: {
    position: "absolute",
    transform: "translateX(-50%)",
    bottom: "-38%",
    height: "27.5rem",
    left: "50%",
    width: "27.5rem",
  },
  disc: {
    background: `radial-gradient(circle at 50% 42%, ${scene.goldPale} 0%, ${scene.gold} 30%, ${scene.brand} 64%, #b5281a 100%)`,
    inset: 0,
    borderRadius: "9999px",
    boxShadow: "0 0 120px 30px rgba(242,69,45,0.5), 0 0 220px 80px rgba(255,184,32,0.25)",
    position: "absolute",
  },
  vignette: {
    background: `linear-gradient(180deg, ${scene.night} 0%, rgba(18,10,7,0.35) 26%, rgba(18,10,7,0.5) 50%, rgba(18,10,7,0.15) 78%, rgba(18,10,7,0.35) 100%)`,
    inset: 0,
    position: "absolute",
  },
})
const citationStyles = stylex.create({
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
  slide: {
    textShadow: "0 2px 18px rgba(10,5,3,0.7)",
    minHeight: "11.75rem",
  },
  quote: {
    color: scene.paper,
    fontFamily: font.heading,
    fontSize: "clamp(24px, 2.4vw, 34px)",
    fontStyle: "italic",
    fontWeight: 700,
    lineHeight: 1.22,
    textWrap: "balance",
    marginBottom: "1.375rem",
    marginTop: "1rem",
  },
  author: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
  },
  avatar: {
    borderRadius: radius.full,
    alignItems: "center",
    backgroundImage: `linear-gradient(140deg, ${scene.brand}, ${scene.gold})`,
    color: scene.ink,
    display: "inline-flex",
    flexShrink: 0,
    fontFamily: font.heading,
    fontSize: text.lg,
    fontWeight: 700,
    justifyContent: "center",
    height: "2.625rem",
    width: "2.625rem",
  },
  identity: {
    lineHeight: 1.25,
  },
  who: {
    fontWeight: 700,
  },
  role: {
    color: `color-mix(in srgb, ${scene.paper} 55%, transparent)`,
    fontSize: "13px",
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

export const AuthForm = ({ type }: { type: "sign-in" | "sign-up" }) => {
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

  return (
    <div data-auth-screen sx={styles.screen}>
      <div sx={sceneStyles.root}>
        <div sx={sunStyles.root}>
          <Animated sx={sunStyles.aurora} animation="scene-aurora 14s ease-in-out infinite" />
          <div sx={sunStyles.system}>
            <SunRays />
            <Animated sx={sunStyles.disc} animation="scene-sun-breathe 7s ease-in-out infinite" />
          </div>
          <div sx={sunStyles.vignette} />
        </div>
        <Embers />
        <Link to="/" {...stylex.props(sceneStyles.logo)}>
          <TaiyoLogoLockup sx={sceneStyles.lockup} />
        </Link>
        {citation === undefined ? null : (
          <div
            onMouseEnter={() => {
              setPaused(true)
            }}
            onMouseLeave={() => {
              setPaused(false)
            }}
            sx={citationStyles.root}
          >
            <div sx={citationStyles.scrim} />
            <div sx={citationStyles.badge}>
              <HugeiconsIcon icon={QuoteDownIcon} {...stylex.props(citationStyles.badgeIcon)} />
              {m.auth_reviews_badge()}
            </div>
            <div key={index} sx={citationStyles.slide}>
              <Stars filled={citation.rating} />
              <p sx={citationStyles.quote}>{`“${citation.quote()}”`}</p>
              <div sx={citationStyles.author}>
                <span sx={citationStyles.avatar}>{citation.who.charAt(0).toUpperCase()}</span>
                <div sx={citationStyles.identity}>
                  <div sx={citationStyles.who}>{citation.who}</div>
                  <div sx={citationStyles.role}>{citation.role()}</div>
                </div>
              </div>
            </div>
            <div sx={citationStyles.dots}>
              {CITATIONS.map((item, dot) => (
                <button
                  key={item.who}
                  type="button"
                  aria-label={m.auth_review_aria({ number: dot + 1 })}
                  onClick={() => {
                    setIndex(dot)
                  }}
                  sx={[citationStyles.dot, dot === index && citationStyles.dotCurrent]}
                />
              ))}
            </div>
          </div>
        )}
        <div sx={sceneStyles.tagline}>{m.auth_tagline()}</div>
      </div>
      <div sx={styles.panel}>
        <div sx={styles.column}>
          <div sx={styles.tabs}>
            {TABS.map((tab) => (
              <Link
                key={tab.type}
                to={tab.to}
                data-active={tab.type === type}
                {...stylex.props(styles.tab, tab.type === type && styles.tabActive)}
              >
                {tab.label()}
              </Link>
            ))}
          </div>
          {type === "sign-in" ? <SignInForm /> : <SignUpForm />}
        </div>
      </div>
    </div>
  )
}

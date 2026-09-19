import {
  ConstructionIcon,
  LibraryIcon,
  LinkSquare02Icon,
  ServerStack01Icon,
  SmartPhone01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import * as stylex from "@stylexjs/stylex"
import { font, radius, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"

import { Reveal, Section, SectionHead } from "@/components/landing/landing-atoms"
import { scene, sceneFont } from "@/components/scene/scene.stylex"
import { m } from "@/paraglide/messages"

// The anti-pitch. Where a landing page normally sells its features, this one
// talks the reader out of signing up — including, sincerely, a card pointing at
// a competitor. It is the same joke the reviews section runs on.
const FLAWS = [
  { icon: ConstructionIcon, title: m.landing_flaw_broken_title, body: m.landing_flaw_broken_body },
  { icon: LibraryIcon, title: m.landing_flaw_catalog_title, body: m.landing_flaw_catalog_body },
  { icon: LinkSquare02Icon, title: m.landing_flaw_kuro_title, body: m.landing_flaw_kuro_body },
  {
    icon: ServerStack01Icon,
    title: m.landing_flaw_servers_title,
    body: m.landing_flaw_servers_body,
  },
  { icon: UserGroupIcon, title: m.landing_flaw_team_title, body: m.landing_flaw_team_body },
  { icon: SmartPhone01Icon, title: m.landing_flaw_app_title, body: m.landing_flaw_app_body },
]
const styles = stylex.create({
  band: {
    paddingBlock: "clamp(5rem,11vw,8.75rem)",
    backgroundColor: scene.night,
  },
  grid: {
    gap: "1.25rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(17.5rem, 1fr))",
    marginTop: "3.5rem",
  },
  card: {
    borderColor: `color-mix(in srgb, ${scene.paper} 10%, transparent)`,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: "1px",
    overflow: "hidden",
    paddingBlock: "2.125rem",
    paddingInline: "1.875rem",
    backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${scene.paper} 5%, transparent), color-mix(in srgb, ${scene.paper} 2%, transparent))`,
    position: "relative",
    transitionDuration: "200ms",
    transitionProperty: "transform, box-shadow",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    height: "100%",
  },
  cardHovered: {
    boxShadow: "0 24px 50px rgba(0,0,0,0.45)",
    transform: "translateY(-5px)",
  },
  // A corona bleeding in from the top-right corner, brighter on hover — the
  // card's only tie back to the sun.
  corona: {
    borderRadius: "50%",
    backgroundImage: `radial-gradient(circle, color-mix(in srgb, ${scene.brand} 50%, transparent), transparent 70%)`,
    filter: "blur(20px)",
    opacity: 0.4,
    position: "absolute",
    transitionDuration: "200ms",
    transitionProperty: "opacity",
    height: "10rem",
    right: "-2.5rem",
    top: "-3.75rem",
    width: "10rem",
  },
  coronaHovered: {
    opacity: 0.9,
  },
  body: {
    position: "relative",
    zIndex: 2,
  },
  glyph: {
    borderRadius: radius.md,
    alignItems: "center",
    backgroundImage: `linear-gradient(140deg, ${scene.brand}, ${scene.gold})`,
    boxShadow: `0 8px 22px color-mix(in srgb, ${scene.brand} 40%, transparent)`,
    color: scene.ink,
    display: "flex",
    justifyContent: "center",
    height: "3.375rem",
    marginBottom: "1.375rem",
    width: "3.375rem",
  },
  title: {
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: text.xl,
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
    marginBottom: "0.625rem",
    marginLeft: "0",
    marginRight: "0",
    marginTop: "0",
  },
  text: {
    margin: 0,
    color: `color-mix(in srgb, ${scene.paper} 60%, transparent)`,
    fontSize: text.base,
    lineHeight: 1.6,
  },
})
const FlawCard = ({ icon, title, body }: { icon: IconSvgElement; title: string; body: string }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      sx={[styles.card, hovered && styles.cardHovered]}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div sx={[styles.corona, hovered && styles.coronaHovered]} />
      <div sx={styles.body}>
        <div sx={styles.glyph}>
          <HugeiconsIcon icon={icon} size={26} />
        </div>
        <h3 sx={styles.title}>{title}</h3>
        <p sx={styles.text}>{body}</p>
      </div>
    </div>
  )
}

export const LandingFlaws = () => (
  <section sx={styles.band}>
    <Section>
      <Reveal>
        <SectionHead
          centered
          eyebrow={m.landing_flaws_eyebrow()}
          title={m.landing_flaws_title()}
          sub={m.landing_flaws_subtitle()}
        />
      </Reveal>
      <div sx={styles.grid}>
        {FLAWS.map((flaw, i) => (
          <Reveal key={flaw.title()} delay={i * 90}>
            <FlawCard icon={flaw.icon} title={flaw.title()} body={flaw.body()} />
          </Reveal>
        ))}
      </div>
    </Section>
  </section>
)

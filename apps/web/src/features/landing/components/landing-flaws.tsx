import {
  ConstructionIcon,
  LibraryIcon,
  LinkSquare02Icon,
  ServerStack01Icon,
  SmartPhone01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import * as stylex from "@stylexjs/stylex"
import { scene } from "@/components/scene/scene.stylex"
import { FlawCard } from "@/features/landing/components/flaw-card"
import { Reveal } from "@/features/landing/components/reveal"
import { Section } from "@/features/landing/components/section"
import { SectionHead } from "@/features/landing/components/section-head"
import { m } from "@/paraglide/messages"

const FLAWS = [
  {
    id: "broken",
    icon: ConstructionIcon,
    title: m.landing_flaw_broken_title,
    body: m.landing_flaw_broken_body,
  },
  {
    id: "catalog",
    icon: LibraryIcon,
    title: m.landing_flaw_catalog_title,
    body: m.landing_flaw_catalog_body,
  },
  {
    id: "kuro",
    icon: LinkSquare02Icon,
    title: m.landing_flaw_kuro_title,
    body: m.landing_flaw_kuro_body,
  },
  {
    id: "servers",
    icon: ServerStack01Icon,
    title: m.landing_flaw_servers_title,
    body: m.landing_flaw_servers_body,
  },
  {
    id: "team",
    icon: UserGroupIcon,
    title: m.landing_flaw_team_title,
    body: m.landing_flaw_team_body,
  },
  {
    id: "app",
    icon: SmartPhone01Icon,
    title: m.landing_flaw_app_title,
    body: m.landing_flaw_app_body,
  },
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
})

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
          <Reveal key={flaw.id} delay={i * 90}>
            <FlawCard icon={flaw.icon} title={flaw.title()} body={flaw.body()} />
          </Reveal>
        ))}
      </div>
    </Section>
  </section>
)

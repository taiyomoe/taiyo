import * as stylex from "@stylexjs/stylex"
import { TaiyoLogoLockup } from "@taiyomoe/ui/components/logos/taiyo-logo-lockup"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { scene, sceneFont } from "@/components/scene/scene.stylex"
import { env } from "@/env/client"
import { Section } from "@/features/landing/components/section"
import { m } from "@/paraglide/messages"

const LEGAL_LINKS = [
  { id: "terms", label: m.landing_footer_terms, to: "/terms" },
  { id: "privacy", label: m.landing_footer_privacy, to: "/privacy" },
  { id: "dmca", label: m.landing_footer_content_policy, to: "/dmca" },
] as const
const styles = stylex.create({
  lockup: {
    gap: "0.75rem",
    fontFamily: sceneFont.display,
    fontSize: "21px",
    fontWeight: 700,
  },
  footer: {
    backgroundColor: scene.nightDeep,
    borderTopColor: `color-mix(in srgb, ${scene.paper} 7%, transparent)`,
    borderTopStyle: "solid",
    borderTopWidth: "1px",
    paddingBottom: "2.25rem",
    paddingTop: "4rem",
  },
  grid: {
    gap: "2.5rem",
    display: "grid",
    gridTemplateColumns: { default: "1fr", [breakpoints.md]: "2fr repeat(2, 1fr)" },
  },
  brand: {
    color: scene.paper,
    display: "inline-block",
    textDecorationLine: "none",
    marginBottom: "0.875rem",
  },
  tagline: {
    margin: 0,
    color: `color-mix(in srgb, ${scene.paper} 45%, transparent)`,
    fontSize: "0.875rem",
    lineHeight: 1.6,
    maxWidth: "16.25rem",
  },
  heading: {
    color: `color-mix(in srgb, ${scene.paper} 40%, transparent)`,
    fontSize: "0.75rem",
    fontWeight: 800,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "1rem",
  },
  links: {
    gap: "0.6875rem",
    display: "flex",
    flexDirection: "column",
  },
  link: {
    color: {
      default: `color-mix(in srgb, ${scene.paper} 66%, transparent)`,
      ":hover": scene.paper,
    },
    fontSize: "0.875rem",
    textDecorationLine: "none",
    transitionDuration: "150ms",
    transitionProperty: "color",
    width: "fit-content",
  },
})

export const LandingFooter = () => (
  <footer sx={styles.footer}>
    <Section>
      <div sx={styles.grid}>
        <div>
          <Link to="/" {...stylex.props(styles.brand)}>
            <TaiyoLogoLockup sx={styles.lockup} />
          </Link>
          <p sx={styles.tagline}>{m.landing_footer_tagline()}</p>
        </div>
        {env.VITE_DISCORD_INVITE_URL === undefined ? null : (
          <div>
            <div sx={styles.heading}>{m.landing_footer_col_community()}</div>
            <div sx={styles.links}>
              <a
                href={env.VITE_DISCORD_INVITE_URL}
                rel="noreferrer"
                sx={styles.link}
                target="_blank"
              >
                {m.landing_footer_discord()}
              </a>
            </div>
          </div>
        )}
        <div>
          <div sx={styles.heading}>{m.landing_footer_col_legal()}</div>
          <div sx={styles.links}>
            {LEGAL_LINKS.map((link) => (
              <Link key={link.id} to={link.to} {...stylex.props(styles.link)}>
                {link.label()}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Section>
  </footer>
)

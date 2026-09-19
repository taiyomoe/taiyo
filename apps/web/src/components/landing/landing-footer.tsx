import * as stylex from "@stylexjs/stylex"
import { Link } from "@tanstack/react-router"
import { TaiyoLogoLockup } from "@taiyomoe/ui/components/logos/taiyo-logo-lockup"
import { font } from "@taiyomoe/ui/styles/tokens.stylex"

import { Section } from "@/components/landing/landing-atoms"
import { scene } from "@/components/scene/scene.stylex"
import { m } from "@/paraglide/messages"

// `href: "#titles"` is the in-page cover strip — a real destination until the
// catalog, community and company routes exist. Nothing here points at a route
// that has not been built.
const COLUMNS = [
  {
    heading: m.landing_footer_col_read,
    links: [
      { label: m.landing_footer_browse, href: "#titles" },
      { label: m.landing_footer_latest, href: "#titles" },
      { label: m.landing_footer_popular, href: "#titles" },
      { label: m.landing_footer_random, href: "#titles" },
    ],
  },
  {
    heading: m.landing_footer_col_taiyo,
    links: [
      { label: m.landing_footer_about, href: "#" },
      { label: m.landing_footer_careers, href: "#" },
      { label: m.landing_footer_press, href: "#" },
      { label: m.landing_footer_sun, href: "#" },
    ],
  },
  {
    heading: m.landing_footer_col_community,
    links: [
      { label: m.landing_footer_discord, href: "#" },
      { label: m.landing_footer_translator, href: "#" },
      { label: m.landing_footer_guidelines, href: "#" },
      { label: m.landing_footer_report, href: "#" },
    ],
  },
]
const styles = stylex.create({
  lockup: {
    gap: "0.75rem",
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
    gridTemplateColumns: { default: "1fr", "@media (width >= 54rem)": "1.4fr repeat(3, 1fr)" },
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
  base: {
    gap: "0.875rem",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    borderTopColor: `color-mix(in srgb, ${scene.paper} 7%, transparent)`,
    borderTopStyle: "solid",
    borderTopWidth: "1px",
    marginTop: "3rem",
    paddingTop: "1.5rem",
  },
  copyright: {
    color: `color-mix(in srgb, ${scene.paper} 40%, transparent)`,
    fontFamily: font.mono,
    fontSize: "0.75rem",
  },
  legal: {
    gap: "1.25rem",
    display: "flex",
  },
  legalLink: {
    color: {
      default: `color-mix(in srgb, ${scene.paper} 40%, transparent)`,
      ":hover": scene.paper,
    },
    fontSize: "0.75rem",
    textDecorationLine: "none",
    transitionDuration: "150ms",
    transitionProperty: "color",
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
        {COLUMNS.map((column) => (
          <div key={column.heading()}>
            <div sx={styles.heading}>{column.heading()}</div>
            <div sx={styles.links}>
              {column.links.map((link) => (
                <a key={link.label()} href={link.href} sx={styles.link}>
                  {link.label()}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div sx={styles.base}>
        <span sx={styles.copyright}>{m.landing_footer_copyright()}</span>
        <div sx={styles.legal}>
          <Link to="/terms" {...stylex.props(styles.legalLink)}>
            {m.landing_footer_terms()}
          </Link>
          <Link to="/privacy" {...stylex.props(styles.legalLink)}>
            {m.landing_footer_privacy()}
          </Link>
          <a href="#" sx={styles.legalLink}>
            {m.landing_footer_content_policy()}
          </a>
        </div>
      </div>
    </Section>
  </footer>
)

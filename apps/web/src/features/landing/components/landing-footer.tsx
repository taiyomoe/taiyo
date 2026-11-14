import * as stylex from "@stylexjs/stylex"
import { scene, sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { env } from "@/env/client"
import { Section } from "@/features/landing/components/section"
import { LEGAL_LINKS } from "@/features/landing/lib/landing-data"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  footer: {
    overflow: "hidden",
    backgroundColor: scene.nightDeep,
    paddingTop: "3rem",
  },
  row: {
    gap: "1.25rem",
    alignItems: { default: "flex-start", [breakpoints.md]: "center" },
    display: "flex",
    flexDirection: { default: "column", [breakpoints.md]: "row" },
    justifyContent: "space-between",
  },
  tagline: {
    margin: 0,
    color: `color-mix(in srgb, ${scene.paper} 45%, transparent)`,
    fontSize: "0.875rem",
    maxWidth: "26rem",
  },
  links: {
    columnGap: "1.75rem",
    display: "flex",
    flexWrap: "wrap",
    rowGap: "0.75rem",
  },
  link: {
    color: {
      default: `color-mix(in srgb, ${scene.paper} 55%, transparent)`,
      ":hover": `color-mix(in srgb, ${scene.paper} 80%, transparent)`,
    },
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    textDecorationLine: "none",
    transitionDuration: "150ms",
    transitionProperty: "color",
  },
  mark: {
    backgroundClip: "text",
    backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${scene.gold} 62%, transparent) 0%, color-mix(in srgb, ${scene.brand} 36%, transparent) 60%, color-mix(in srgb, ${scene.brand} 14%, transparent) 100%)`,
    color: "transparent",
    fontFamily: sceneFont.display,
    fontSize: "min(27vw, 22rem)",
    fontWeight: font.weightBold,
    letterSpacing: "0.01em",
    lineHeight: 1,
    textAlign: "center",
    textTransform: "uppercase",
    userSelect: "none",
    whiteSpace: "nowrap",
    marginTop: "clamp(2rem,5vw,3.5rem)",
    paddingBottom: "clamp(1rem,3vw,2rem)",
  },
})

export const LandingFooter = () => (
  <footer sx={styles.footer}>
    <Section>
      <div sx={styles.row}>
        <p sx={styles.tagline}>{m.landing_footer_tagline()}</p>
        <nav sx={styles.links}>
          <Link to="/changelog" {...stylex.props(styles.link)}>
            {m.changelog_title()}
          </Link>
          {env.VITE_DISCORD_INVITE_URL === undefined ? null : (
            <a href={env.VITE_DISCORD_INVITE_URL} rel="noreferrer" target="_blank" sx={styles.link}>
              {m.landing_footer_discord()}
            </a>
          )}
          {LEGAL_LINKS.map((link) => (
            <Link key={link.id} to={link.to} {...stylex.props(styles.link)}>
              {link.label()}
            </Link>
          ))}
        </nav>
      </div>
    </Section>
    <div aria-hidden sx={styles.mark}>
      Taiyō
    </div>
  </footer>
)

import * as stylex from "@stylexjs/stylex"
import { font } from "@taiyomoe/ui/styles/tokens.stylex"

import { scene } from "@/components/scene/scene.stylex"

const styles = stylex.create({
  title: {
    color: scene.paper,
    fontFamily: font.heading,
    fontSize: "clamp(30px, 3.4vw, 42px)",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.05,
    marginTop: "1.75rem",
  },
  subtitle: {
    color: `color-mix(in srgb, ${scene.paper} 60%, transparent)`,
    marginBottom: "1.5rem",
    marginTop: "0.5rem",
  },
})

export const AuthHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <header>
    <h1 sx={styles.title}>{title}</h1>
    <p sx={styles.subtitle}>{subtitle}</p>
  </header>
)

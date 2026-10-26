import * as stylex from "@stylexjs/stylex"
import type { LegalSection } from "@/features/legal/components/legal-page"
import { scene } from "@/components/scene/scene.stylex"

const styles = stylex.create({
  toc: {
    position: { default: "static", "@media (width >= 64rem)": "sticky" },
    top: "6.5rem",
  },
  tocLabel: {
    color: `color-mix(in srgb, ${scene.paper} 40%, transparent)`,
    fontSize: "0.6875rem",
    fontWeight: 800,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    marginBottom: "0.875rem",
  },
  tocList: {
    margin: 0,
    padding: 0,
    gap: "0.4375rem",
    display: "flex",
    flexDirection: "column",
    listStyleType: "none",
  },
  tocLink: {
    color: {
      default: `color-mix(in srgb, ${scene.paper} 58%, transparent)`,
      ":hover": scene.goldLight,
    },
    fontSize: "0.875rem",
    lineHeight: 1.45,
    textDecorationLine: "none",
    transitionDuration: "150ms",
    transitionProperty: "color",
  },
})

type LegalTocProps = {
  sections: LegalSection[]
}

export const LegalToc = ({ sections }: LegalTocProps) => (
  <nav sx={styles.toc} aria-label="On this page">
    <div sx={styles.tocLabel}>On this page</div>
    <ol sx={styles.tocList}>
      {sections.map((section) => (
        <li key={section.id}>
          <a href={`#${section.id}`} sx={styles.tocLink}>
            {section.heading}
          </a>
        </li>
      ))}
    </ol>
  </nav>
)

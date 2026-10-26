import * as stylex from "@stylexjs/stylex"
import { font, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { scene, sceneFont } from "@/components/scene/scene.stylex"
import { Eyebrow } from "@/features/landing/components/eyebrow"

const styles = stylex.create({
  head: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    maxWidth: "38.75rem",
  },
  headCentered: {
    marginInline: "auto",
    alignItems: "center",
    textAlign: "center",
    maxWidth: "45rem",
  },
  headTitle: {
    margin: 0,
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: "clamp(2rem, 4.4vw, 3.25rem)",
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.04,
    textWrap: "balance",
  },
  headSub: {
    margin: 0,
    color: `color-mix(in srgb, ${scene.paper} 62%, transparent)`,
    fontSize: text.lg,
    lineHeight: 1.55,
    textWrap: "pretty",
  },
})

type SectionHeadProps = {
  eyebrow: string
  title: string
  sub?: string
  centered?: boolean
}

export const SectionHead = ({ eyebrow, title, sub, centered = false }: SectionHeadProps) => (
  <div sx={[styles.head, centered && styles.headCentered]}>
    <Eyebrow centered={centered}>{eyebrow}</Eyebrow>
    <h2 sx={styles.headTitle}>{title}</h2>
    {sub !== undefined && sub !== "" ? <p sx={styles.headSub}>{sub}</p> : null}
  </div>
)

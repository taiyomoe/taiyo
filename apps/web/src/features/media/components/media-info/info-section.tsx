import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { sceneFont } from "@/components/scene/scene.stylex"

const styles = stylex.create({
  section: {
    gap: "0.875rem",
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontFamily: sceneFont.display,
    fontSize: "1.375rem",
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
  },
})

export function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section sx={styles.section}>
      <h3 sx={styles.heading}>{title}</h3>
      {children}
    </section>
  )
}

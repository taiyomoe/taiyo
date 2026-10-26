import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"

const styles = stylex.create({
  section: {
    marginInline: "auto",
    paddingInline: "clamp(1.25rem,4vw,2.5rem)",
    maxWidth: "75rem",
    width: "100%",
  },
})

type SectionProps = {
  children: ReactNode
}

export const Section = ({ children }: SectionProps) => <div sx={styles.section}>{children}</div>

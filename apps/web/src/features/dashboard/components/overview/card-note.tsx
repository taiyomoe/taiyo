import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  note: {
    margin: 0,
    paddingBlock: "2rem",
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    textAlign: "center",
  },
})

type CardNoteProps = {
  children: ReactNode
}

export function CardNote({ children }: CardNoteProps) {
  return <p sx={styles.note}>{children}</p>
}

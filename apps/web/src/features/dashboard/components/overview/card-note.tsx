import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  note: {
    margin: 0,
    flex: "1",
    paddingBlock: "2rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.875rem",
    justifyContent: "center",
    textAlign: "center",
  },
})

export function CardNote({ children }: { children: ReactNode }) {
  return <p sx={styles.note}>{children}</p>
}

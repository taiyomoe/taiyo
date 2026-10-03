import * as stylex from "@stylexjs/stylex"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    padding: "2rem",
    gap: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    justifyContent: "center",
    minHeight: "12rem",
  },
})

export function DefaultPendingComponent() {
  return (
    <div sx={styles.root}>
      <Spinner />
      <span>{m.loading()}</span>
    </div>
  )
}

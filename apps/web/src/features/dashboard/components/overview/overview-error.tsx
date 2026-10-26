import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Card } from "@taiyomoe/ui/components/ui/card"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  error: {
    padding: "1.5rem",
    gap: "1rem",
    alignItems: "flex-start",
  },
  errorText: {
    margin: 0,
    color: colors.mutedForeground,
  },
})

type OverviewErrorProps = {
  onRetry: () => void
}

export function OverviewError({ onRetry }: OverviewErrorProps) {
  return (
    <Card sx={styles.error}>
      <p sx={styles.errorText}>{m.dashboard_error()}</p>
      <Button onClick={onRetry} variant="outline">
        {m.dashboard_retry()}
      </Button>
    </Card>
  )
}

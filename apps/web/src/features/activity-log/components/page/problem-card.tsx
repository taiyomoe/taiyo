import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Card } from "@taiyomoe/ui/components/ui/card"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  problem: {
    padding: "1.5rem",
    gap: "1rem",
    alignItems: "flex-start",
  },
  problemText: {
    margin: 0,
    color: colors.mutedForeground,
  },
})

export function ProblemCard({
  message,
  action,
  onAction,
}: {
  message: string
  action: string
  onAction: () => void
}) {
  return (
    <Card sx={styles.problem}>
      <p sx={styles.problemText}>{message}</p>
      <Button
        onClick={() => {
          onAction()
        }}
        variant="outline"
      >
        {action}
      </Button>
    </Card>
  )
}

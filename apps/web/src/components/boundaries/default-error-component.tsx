import type { ErrorComponentProps } from "@tanstack/react-router"
import * as stylex from "@stylexjs/stylex"
import { Alert, AlertDescription, AlertTitle } from "@taiyomoe/ui/components/ui/alert"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
  },
  alert: {
    maxWidth: "32rem",
  },
})

export function DefaultErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div sx={styles.root}>
      <Alert sx={styles.alert} variant="error">
        <AlertTitle>{m.error_heading()}</AlertTitle>
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    </div>
  )
}

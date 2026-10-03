import * as stylex from "@stylexjs/stylex"
import type { ErrorComponentProps } from "@tanstack/react-router"
import { Alert, AlertDescription, AlertTitle } from "@taiyomoe/ui/components/ui/alert"

import { getApiErrorCode } from "@/lib/envelope"
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
  const code = getApiErrorCode(error)
  const description = code === undefined ? m.error_unknown() : m.error_api_code({ code })

  return (
    <div sx={styles.root}>
      <Alert sx={styles.alert} variant="error">
        <AlertTitle>{m.error_heading()}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </div>
  )
}

import { AlertCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert, AlertTitle } from "@taiyomoe/ui/components/ui/alert"

export const AuthAlert = ({ message }: { message: string | null }) =>
  message ? (
    <Alert variant="error">
      <HugeiconsIcon icon={AlertCircleIcon} />
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  ) : null

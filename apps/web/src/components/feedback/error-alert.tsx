import { AlertCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert, AlertTitle } from "@taiyomoe/ui/components/ui/alert"

export const ErrorAlert = ({ message }: { message: string | null }) =>
  message !== null && message !== "" ? (
    <Alert variant="error">
      <HugeiconsIcon icon={AlertCircleIcon} />
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  ) : null

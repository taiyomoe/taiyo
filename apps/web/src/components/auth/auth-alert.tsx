import { Alert, AlertTitle } from "@taiyomoe/ui/components/ui/alert"
import { CircleAlert } from "lucide-react"

export const AuthAlert = ({ message }: { message: string | null }) =>
  message ? (
    <Alert variant="error">
      <CircleAlert />
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  ) : null

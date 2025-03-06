import { authClient } from "@taiyomoe/auth/client"
import { type SignedInProps, computeAccess } from "./shared"

export const SignedIn = (props: SignedInProps) => {
  const { data: session } = authClient.useSession()

  return computeAccess(props, session)
}

import { useSession } from "@taiyomoe/auth/client"
import { type SignedInProps, computeAccess } from "./shared"

export const SignedIn = (props: SignedInProps) => {
  const { data } = useSession()

  return computeAccess(props, data)
}

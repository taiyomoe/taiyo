import { useSession } from "@taiyomoe/auth"
import { type SignedInProps, computeAccess } from "./shared"

export const SignedIn = (props: SignedInProps) => {
  const { data } = useSession()

  return computeAccess(props, data)
}

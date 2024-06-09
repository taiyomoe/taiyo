import { auth } from "@taiyomoe/auth"
import { type SignedInProps, computeAccess } from "./shared"

export const SignedIn = async (props: SignedInProps) => {
  const session = await auth()

  return computeAccess(props, session)
}

import { getSession } from "~/utils/get-session"
import { type SignedInProps, computeAccess } from "./shared"

export const SignedIn = async (props: SignedInProps) => {
  const session = await getSession()

  return computeAccess(props, session)
}

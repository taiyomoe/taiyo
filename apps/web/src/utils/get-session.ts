import { type Session, auth } from "@taiyomoe/auth/server"
import { headers } from "next/headers"
import { cache } from "react"

export const getSession = cache(
  () => auth.api.getSession({ headers: headers() }) as Promise<Session | null>,
)

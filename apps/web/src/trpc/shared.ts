import { env } from "~/env"

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin
  return env.BETTER_AUTH_URL
}

import { env } from "~/env"

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin
  if (process.env.COOLIFY_URL) return process.env.COOLIFY_URL
  return env.AUTH_URL
}

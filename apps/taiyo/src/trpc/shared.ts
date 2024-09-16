import { env } from "~/env"

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return env.NEXTAUTH_URL
}

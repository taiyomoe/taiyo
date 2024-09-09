import { getClient } from "@umami/api-client"
import { env } from "../env"

export const umamiClient = getClient({
  apiEndpoint: `${env.NEXT_PUBLIC_UMAMI_URL}/api/`,
  userId: env.UMAMI_USER_ID,
  secret: env.UMAMI_SECRET,
})

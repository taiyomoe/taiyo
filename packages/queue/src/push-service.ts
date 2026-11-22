import { config } from "@taiyomoe/config"

export const isPushServiceEndpoint = (endpoint: string) => {
  if (!URL.canParse(endpoint)) {
    return false
  }

  const { protocol, hostname } = new URL(endpoint)
  const host = hostname.toLowerCase()

  return (
    protocol === "https:" &&
    (config.notifications.pushServiceHosts.some((allowed) => host === allowed) ||
      config.notifications.pushServiceDomains.some((domain) => host.endsWith(domain)))
  )
}

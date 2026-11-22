import { config } from "@taiyomoe/config"

/** Whether an endpoint is an https URL on one of the push services browsers use. */
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

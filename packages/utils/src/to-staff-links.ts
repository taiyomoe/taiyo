import { STAFF_LINK_KEYS, type StaffLinks } from "@taiyomoe/db"

export const toStaffLinks = (input: Record<string, unknown>): StaffLinks => {
  const links: StaffLinks = {}

  for (const [key, value] of Object.entries(input)) {
    if (typeof value !== "string" || value === "") {
      continue
    }

    if (key === "melonBook") {
      links.melonBooks = value

      continue
    }

    const link = STAFF_LINK_KEYS.find((candidate) => candidate === key)

    if (link !== undefined) {
      links[link] = value

      continue
    }

    // oxlint-disable-next-line no-console
    console.warn(`Invalid staff link key "${key}", skipping...`)
  }

  return links
}

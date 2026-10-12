import { isStaffLink, type StaffLinks } from "@taiyomoe/db"

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

    if (isStaffLink(key)) {
      links[key] = value

      continue
    }

    // oxlint-disable-next-line no-console
    console.warn(`Invalid staff link key "${key}", skipping...`)
  }

  return links
}

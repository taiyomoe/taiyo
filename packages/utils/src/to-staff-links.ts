import { config } from "@taiyomoe/config"
import type { StaffLink } from "@taiyomoe/db"

export const toStaffLinks = (
  input: Record<string, unknown>,
): StaffLink => {
  const links: StaffLink = {}

  for (const [key, value] of Object.entries(input)) {
    if (!value || typeof value !== "string") {
      continue
    }

    if (key === "melonBook") {
      links.melonBooks = value

      continue
    }

    if (config.staff.links.includes(key)) {
      links[key as keyof StaffLink] = value

      continue
    }

    console.warn(`Invalid staff link key "${key}", skipping...`)
  }

  return links
}

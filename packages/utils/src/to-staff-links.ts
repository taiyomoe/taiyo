import { config } from "@taiyomoe/config"

export const toStaffLinks = (
  input: Record<string, unknown>,
): PrismaJson.StaffLink => {
  const links: PrismaJson.StaffLink = {}

  for (const [key, value] of Object.entries(input)) {
    if (!value || typeof value !== "string") {
      continue
    }

    if (key === "melonBook") {
      links.melonBooks = value

      continue
    }

    if (config.staff.links.includes(key)) {
      links[key as keyof PrismaJson.StaffLink] = value

      continue
    }

    console.warn(`Invalid staff link key "${key}", skipping...`)
  }

  return links
}

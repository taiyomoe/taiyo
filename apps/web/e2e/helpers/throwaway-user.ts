import type { Browser } from "@playwright/test"
import { execFileSync } from "node:child_process"
import { resolve } from "node:path"
import { z } from "zod"

const userSchema = z.object({
  userId: z.string(),
  username: z.string(),
  email: z.string(),
  cookie: z.string(),
})

/** A fresh account signed in a new browser context, for a test that changes it for good. */
export const newThrowawayUser = async (browser: Browser) => {
  const output = execFileSync("pnpm", ["--silent", "-F", "@taiyomoe/scripts", "cli", "e2e-user"], {
    cwd: resolve(import.meta.dirname, "../../../.."),
    encoding: "utf8",
  })
  const line = output.split("\n").find((candidate) => candidate.startsWith("{"))
  const user = userSchema.parse(JSON.parse(line ?? "null"))
  const separator = user.cookie.indexOf("=")
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } })

  await context.addCookies([
    {
      name: user.cookie.slice(0, separator),
      value: user.cookie.slice(separator + 1),
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ])

  return { ...user, context }
}

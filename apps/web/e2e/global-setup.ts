import { type FullConfig, chromium } from "@playwright/test"
import { execFileSync } from "node:child_process"
import { mkdirSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

export default async (config: FullConfig) => {
  const output = execFileSync(
    "pnpm",
    ["--silent", "-F", "@taiyomoe/scripts", "cli", "dev-sessions"],
    { cwd: resolve(import.meta.dirname, "../../.."), encoding: "utf8" },
  )
  const sessions = output
    .split("\n")
    .map((line): unknown => (line.startsWith("{") ? JSON.parse(line) : null))
    .flatMap((session) =>
      typeof session === "object" &&
      session !== null &&
      "username" in session &&
      "cookie" in session &&
      typeof session.username === "string" &&
      typeof session.cookie === "string"
        ? [{ username: session.username, cookie: session.cookie }]
        : [],
    )

  if (!sessions.some((session) => session.username === "admin")) {
    throw new Error("dev-sessions printed no admin session; run `pnpm bootstrap` first")
  }

  mkdirSync(resolve(import.meta.dirname, ".auth"), { recursive: true })

  for (const { username, cookie } of sessions) {
    const separator = cookie.indexOf("=")

    writeFileSync(
      resolve(import.meta.dirname, `.auth/${username}.json`),
      JSON.stringify({
        cookies: [
          {
            name: cookie.slice(0, separator),
            value: cookie.slice(separator + 1),
            domain: "localhost",
            path: "/",
            expires: -1,
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
          },
        ],
        origins: [],
      }),
    )
  }

  const baseURL = config.projects[0]?.use.baseURL
  const browser = await chromium.launch()
  const page = await browser.newPage({
    ...(baseURL === undefined ? {} : { baseURL }),
    storageState: resolve(import.meta.dirname, ".auth/admin.json"),
  })

  for (const [path, root] of [
    ["/", "header"],
    ["/media/00000000-0000-0000-0000-000000000000", "header"],
    ["/chapters/2a512ed1-dee2-4742-b0c1-f5979ad6b289", "main"],
  ] as const) {
    await page.goto(path, { timeout: 180_000 })
    await page.waitForFunction(
      (selector) =>
        Object.keys(document.querySelector(selector) ?? {}).some((key) =>
          key.startsWith("__react"),
        ),
      root,
      { timeout: 180_000 },
    )
  }

  await browser.close()
}

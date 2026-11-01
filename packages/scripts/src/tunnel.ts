import { type ChildProcess, spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { readEnvFile, repoRoot, requireEnvValue } from "./env-file.ts"

const TUNNEL_URL = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/
const TUNNEL_TIMEOUT_MS = 60_000
const children: ChildProcess[] = []
const shutdown = (code: number) => {
  for (const child of children) {
    if (child.pid !== undefined && child.exitCode === null) {
      try {
        process.kill(-child.pid, "SIGTERM")
      } catch {
        child.kill("SIGTERM")
      }
    }
  }

  process.exit(code)
}
const openTunnel = (port: string) =>
  new Promise<string>((resolveUrl, reject) => {
    const child = spawn(
      "cloudflared",
      ["tunnel", "--no-autoupdate", "--url", `http://localhost:${port}`],
      { stdio: ["ignore", "pipe", "pipe"], detached: true },
    )

    children.push(child)

    const timer = setTimeout(() => {
      reject(new Error(`cloudflared gave no URL for port ${port} within 60s`))
    }, TUNNEL_TIMEOUT_MS)
    const onOutput = (chunk: Buffer) => {
      const url = TUNNEL_URL.exec(chunk.toString())?.[0]

      if (url !== undefined) {
        clearTimeout(timer)
        resolveUrl(url)
      }
    }

    child.stdout.on("data", onOutput)
    child.stderr.on("data", onOutput)
    child.once("error", (error: NodeJS.ErrnoException) => {
      clearTimeout(timer)
      reject(
        error.code === "ENOENT"
          ? new Error(
              "cloudflared is not installed. See https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/",
            )
          : error,
      )
    })
    child.once("exit", (code) => {
      clearTimeout(timer)
      const error = new Error(`cloudflared for port ${port} exited with code ${code}`)

      reject(error)
      console.error(`\u001B[31m${error.message}\u001B[0m`)
      shutdown(1)
    })
  })

process.once("SIGINT", () => shutdown(130))
process.once("SIGTERM", () => shutdown(143))

try {
  const rootEnvPath = join(repoRoot, ".env")

  if (!existsSync(rootEnvPath)) {
    throw new Error("No .env yet. Run `pnpm bootstrap` first.")
  }

  const root = readEnvFile(rootEnvPath)
  const [webUrl, apiUrl] = await Promise.all([
    openTunnel(requireEnvValue(root, "WEB_PORT", rootEnvPath)),
    openTunnel(requireEnvValue(root, "API_PORT", rootEnvPath)),
  ])

  console.log(`
\u001B[1mTunnels are up.\u001B[0m The web app reaches the API through its own origin, so
sign-in cookies work.

  Web       ${webUrl}
  API docs  ${apiUrl}/docs
`)

  const dev = spawn("pnpm", ["run", "dev", "--ui=stream"], {
    cwd: repoRoot,
    stdio: "inherit",
    detached: true,
    env: {
      ...process.env,
      VITE_API_URL: `${webUrl}/_api`,
      VITE_BETTER_AUTH_URL: webUrl,
    },
  })

  children.push(dev)
  dev.once("exit", (code) => shutdown(code ?? 0))
} catch (error: unknown) {
  console.error(`\u001B[31m${error instanceof Error ? error.message : String(error)}\u001B[0m`)
  shutdown(1)
}

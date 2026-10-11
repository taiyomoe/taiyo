import { execFileSync, spawnSync } from "node:child_process"
import { copyFileSync, existsSync } from "node:fs"
import { createServer } from "node:net"
import { join, relative } from "node:path"
import { parseArgs } from "node:util"
import {
  type EnvValues,
  readEnvFile,
  repoRoot,
  requireEnvValue,
  writeEnvValues,
} from "./env-file.ts"

const PORT_KEYS = [
  "WEB_PORT",
  "API_PORT",
  "DATABASE_PORT",
  "DRAGONFLY_PORT",
  "HYPERDX_PORT",
  "HYPERDX_OTLP_PORT",
  "MEILISEARCH_PORT",
  "RUSTFS_PORT",
  "RUSTFS_CONSOLE_PORT",
] as const
const SLOT_STRIDE = 10
const SLOT_COUNT = 10
const rootEnvPath = join(repoRoot, ".env")
const rootExamplePath = join(repoRoot, ".env.example")
const { values: flags } = parseArgs({
  options: {
    slot: { type: "string" },
    "env-only": { type: "boolean", default: false },
  },
})
const step = (message: string) => console.log(`\n\u001B[1m→ ${message}\u001B[0m`)
const run = (command: string, args: string[]) => {
  const result = spawnSync(command, args, { cwd: repoRoot, stdio: "inherit" })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error(`\`${command} ${args.join(" ")}\` exited with code ${result.status}`)
  }
}
const capture = (command: string, args: string[]) =>
  execFileSync(command, args, { cwd: repoRoot, encoding: "utf8" }).trim()
const isPortFree = (port: number) =>
  new Promise<boolean>((resolvePort) => {
    const server = createServer()

    server.once("error", () => resolvePort(false))
    server.listen(port, "127.0.0.1", () => server.close(() => resolvePort(true)))
  })
const slotPorts = (base: EnvValues, slot: number) =>
  Object.fromEntries(
    PORT_KEYS.map((key) => [
      key,
      String(Number(requireEnvValue(base, key, rootExamplePath)) + slot * SLOT_STRIDE),
    ]),
  )
const portsClaimedByOtherCheckouts = () => {
  const claimed = new Set<string>()
  const worktrees = capture("git", ["worktree", "list", "--porcelain"])
    .split("\n")
    .filter((line) => line.startsWith("worktree "))
    .map((line) => line.slice("worktree ".length))
    .filter((path) => path !== repoRoot)

  for (const worktree of worktrees) {
    const values = readEnvFile(join(worktree, ".env"))

    for (const key of PORT_KEYS) {
      if (values[key]) {
        claimed.add(values[key])
      }
    }
  }

  return claimed
}
const findFreeSlot = async (base: EnvValues) => {
  const claimed = portsClaimedByOtherCheckouts()

  for (let slot = 0; slot < SLOT_COUNT; slot++) {
    const ports = Object.values(slotPorts(base, slot))

    if (ports.some((port) => claimed.has(port))) {
      continue
    }

    const free = await Promise.all(ports.map((port) => isPortFree(Number(port))))

    if (free.every(Boolean)) {
      return slot
    }
  }

  throw new Error(
    `Every port slot from 0 to ${SLOT_COUNT - 1} is taken. Free one, or pass --slot explicitly.`,
  )
}
const ensureRootEnv = async () => {
  const base = readEnvFile(rootExamplePath)
  const exists = existsSync(rootEnvPath)

  if (exists && flags.slot === undefined) {
    const current = readEnvFile(rootEnvPath)
    const missing = PORT_KEYS.filter((key) => !current[key])

    if (missing.length === 0) {
      console.log(".env exists, keeping its ports")

      return
    }

    const offset =
      Number(current.DATABASE_PORT) -
      Number(requireEnvValue(base, "DATABASE_PORT", rootExamplePath))
    const inferred = offset / SLOT_STRIDE
    const slot =
      Number.isInteger(inferred) && inferred >= 0 && inferred < SLOT_COUNT
        ? inferred
        : await findFreeSlot(base)
    const ports = slotPorts(base, slot)

    writeEnvValues(rootEnvPath, Object.fromEntries(missing.map((key) => [key, ports[key] ?? ""])))
    console.log(`.env exists, added ${missing.join(", ")} from port slot ${slot}`)

    return
  }

  const slot = flags.slot === undefined ? await findFreeSlot(base) : Number(flags.slot)

  if (!Number.isInteger(slot) || slot < 0 || slot >= SLOT_COUNT) {
    throw new Error(`--slot must be an integer from 0 to ${SLOT_COUNT - 1}`)
  }

  if (!exists) {
    copyFileSync(rootExamplePath, rootEnvPath)
  }

  writeEnvValues(rootEnvPath, slotPorts(base, slot))
  console.log(`.env ${exists ? "moved to" : "created on"} port slot ${slot}`)
}
const localUrl = (port: string) => `http://localhost:${port}`
const syncAppEnv = (app: string, derive: (current: EnvValues) => EnvValues) => {
  const path = join(repoRoot, "apps", app, ".env")
  const created = !existsSync(path)

  if (created) {
    copyFileSync(join(repoRoot, "apps", app, ".env.example"), path)
  }

  const changed = writeEnvValues(path, derive(readEnvFile(path)))
  const label = relative(repoRoot, path)

  if (created) {
    console.log(`${label} created`)
  } else if (changed.length > 0) {
    console.log(`${label} updated: ${changed.join(", ")}`)
  } else {
    console.log(`${label} already in sync`)
  }
}
const syncAppEnvs = () => {
  const root = readEnvFile(rootEnvPath)
  const get = (key: string) => requireEnvValue(root, key, rootEnvPath)
  const credentials = `${encodeURIComponent(get("DATABASE_USERNAME"))}:${encodeURIComponent(get("DATABASE_PASSWORD"))}`
  const databaseUrl = `postgresql://${credentials}@localhost:${get("DATABASE_PORT")}/${get("DATABASE_NAME")}`
  const s3Endpoint = localUrl(get("RUSTFS_PORT"))
  const apiUrl = localUrl(get("API_PORT"))
  const s3 = (current: EnvValues) => ({
    S3_ENDPOINT: s3Endpoint,
    S3_ACCESS_KEY_ID: get("RUSTFS_ACCESS_KEY"),
    S3_SECRET_ACCESS_KEY: get("RUSTFS_SECRET_KEY"),
    S3_PUBLIC_URL: `${s3Endpoint}/${current.S3_BUCKET_NAME || "taiyo"}`,
  })

  syncAppEnv("api", (current) => ({
    PORT: get("API_PORT"),
    DATABASE_URL: databaseUrl,
    DRAGONFLY_URL: `redis://localhost:${get("DRAGONFLY_PORT")}`,
    HYPERDX_ENDPOINT: localUrl(get("HYPERDX_OTLP_PORT")),
    ...s3(current),
    MEILISEARCH_HOST: localUrl(get("MEILISEARCH_PORT")),
    MEILISEARCH_API_KEY: get("MEILISEARCH_MASTER_KEY"),
    VITE_BETTER_AUTH_URL: apiUrl,
    CORS_ALLOWED_ORIGINS: localUrl(get("WEB_PORT")),
  }))
  syncAppEnv("worker", (current) => ({
    DATABASE_URL: databaseUrl,
    DRAGONFLY_URL: `redis://localhost:${get("DRAGONFLY_PORT")}`,
    ...s3(current),
  }))
  syncAppEnv("web", () => ({
    PORT: get("WEB_PORT"),
    API_PORT: get("API_PORT"),
    VITE_API_URL: apiUrl,
    VITE_BETTER_AUTH_URL: apiUrl,
  }))
}
const databaseIsEmpty = () => {
  const root = readEnvFile(rootEnvPath)
  const count = capture("docker", [
    "compose",
    "exec",
    "-T",
    "postgres",
    "psql",
    "-U",
    requireEnvValue(root, "DATABASE_USERNAME", rootEnvPath),
    "-d",
    requireEnvValue(root, "DATABASE_NAME", rootEnvPath),
    "-tAc",
    "select count(*) from users",
  ])

  return count === "0"
}
const printSummary = () => {
  const root = readEnvFile(rootEnvPath)
  const url = (key: string) => localUrl(requireEnvValue(root, key, rootEnvPath))

  console.log(`
\u001B[1mReady.\u001B[0m Start the apps with \`pnpm dev\`, or \`pnpm dev:tunnel\` for public URLs.

  Web            ${url("WEB_PORT")}
  API docs       ${url("API_PORT")}/docs
  HyperDX        ${url("HYPERDX_PORT")}
  RustFS console ${url("RUSTFS_CONSOLE_PORT")}
`)
}
const main = async () => {
  step("Env files")
  await ensureRootEnv()
  syncAppEnvs()

  if (flags["env-only"]) {
    return
  }

  if (!existsSync(join(repoRoot, "node_modules"))) {
    step("Installing dependencies")
    run("pnpm", ["install"])
  }

  step("Starting infrastructure")
  run("docker", ["compose", "up", "-d", "--wait"])

  step("Creating the S3 bucket")
  run("pnpm", ["-F", "@taiyomoe/scripts", "cli", "init-s3"])

  step("Migrating the database")
  run("pnpm", ["-F", "@taiyomoe/db", "kysely", "migrate", "latest"])

  if (databaseIsEmpty()) {
    step("Seeding the database")
    run("pnpm", ["-F", "@taiyomoe/db", "kysely", "seed", "run"])
  } else {
    step("Database already has data, skipping the seed")
  }

  step("Indexing medias in Meilisearch")
  run("pnpm", ["-F", "@taiyomoe/scripts", "cli", "init-meilisearch"])

  printSummary()
}

main().catch((error: unknown) => {
  console.error(`\n\u001B[31m${error instanceof Error ? error.message : String(error)}\u001B[0m`)
  process.exit(1)
})

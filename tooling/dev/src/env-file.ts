import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { parseEnv } from "node:util"

export const repoRoot = resolve(import.meta.dirname, "../../..")

export type EnvValues = Record<string, string>

export const readEnvFile = (path: string): EnvValues =>
  existsSync(path) ? (parseEnv(readFileSync(path, "utf8")) as EnvValues) : {}

export const requireEnvValue = (values: EnvValues, key: string, path: string) => {
  const value = values[key]

  if (value === undefined || value === "") {
    throw new Error(`${key} is missing from ${path}. Run \`pnpm bootstrap\` to regenerate it.`)
  }

  return value
}

export const writeEnvValues = (path: string, values: EnvValues) => {
  const lines = readFileSync(path, "utf8").split("\n")
  const pending = new Map(Object.entries(values))
  const changed: string[] = []
  const next = lines.map((line) => {
    const key = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line)?.[1]

    if (key === undefined || !pending.has(key)) {
      return line
    }

    const value = pending.get(key) as string

    pending.delete(key)
    const current = parseEnv(line)[key]

    if (current === value) {
      return line
    }

    changed.push(key)

    return `${key}="${value}"`
  })

  for (const [key, value] of pending) {
    if (next.at(-1) === "") {
      next.splice(-1, 0, `${key}="${value}"`)
    } else {
      next.push(`${key}="${value}"`)
    }

    changed.push(key)
  }

  if (changed.length > 0) {
    writeFileSync(path, next.join("\n"))
  }

  return changed
}

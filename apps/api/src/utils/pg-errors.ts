export const isUniqueViolation = (err: unknown, constraint: string): boolean => {
  if (err === null || typeof err !== "object") {
    return false
  }

  const candidate = err as { code?: unknown; constraint?: unknown }

  return candidate.code === "23505" && candidate.constraint === constraint
}

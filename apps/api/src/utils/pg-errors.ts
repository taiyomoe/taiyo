// Detects a Postgres unique_violation error originating from a specific
// constraint. Used by handlers whose pre-check is racy by nature (TOCTOU
// between SELECT and INSERT/UPDATE inside a transaction) so the second
// caller surfaces a typed conflict instead of an opaque 500.
export const isUniqueViolation = (err: unknown, constraint: string): boolean => {
  if (err === null || typeof err !== "object") {
    return false
  }

  const candidate = err as { code?: unknown; constraint?: unknown }

  return candidate.code === "23505" && candidate.constraint === constraint
}

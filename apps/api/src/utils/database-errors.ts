// Whether a Postgres error is a unique violation of the given constraint or index.
export const isUniqueViolation = (err: unknown, constraint: string) =>
  err !== null &&
  typeof err === "object" &&
  "code" in err &&
  "constraint" in err &&
  err.code === "23505" &&
  err.constraint === constraint

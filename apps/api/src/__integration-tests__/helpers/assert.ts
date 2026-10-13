export const defined = <T>(value: T | null | undefined, message = "Expected a value"): T => {
  if (value === null || value === undefined) {
    throw new Error(message)
  }

  return value
}

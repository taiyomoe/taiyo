export const toUnixMs = (value: unknown) => {
  if (value === null || value === undefined) {
    return null
  }

  if (value instanceof Date) {
    return value.getTime()
  }

  if (typeof value === "string" || typeof value === "number") {
    return new Date(value).getTime()
  }

  return null
}

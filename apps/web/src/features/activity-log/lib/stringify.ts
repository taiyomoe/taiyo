export const stringify = (value: unknown) => {
  if (value === undefined) {
    return ""
  }

  return typeof value === "string" ? value : JSON.stringify(value)
}

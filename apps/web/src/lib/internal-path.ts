const BASE = "https://taiyo.invalid"
// Browsers drop tabs and newlines and read a backslash as a slash.
// oxlint-disable-next-line no-control-regex -- matching control characters is the point
const UNSAFE = /[\u0000-\u001F\u007F\\]/

export const isInternalPath = (value: unknown): value is string => {
  if (typeof value !== "string" || !value.startsWith("/") || UNSAFE.test(value)) {
    return false
  }

  return URL.canParse(value, BASE) && new URL(value, BASE).origin === BASE
}

export const toInternalPath = (value: unknown, fallback = "/") =>
  isInternalPath(value) ? value : fallback

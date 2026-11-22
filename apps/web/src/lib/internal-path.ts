// Any fixed origin works: only whether the value leaves it matters. A constant keeps this usable
// during SSR, where there is no window.
const BASE = "https://taiyo.invalid"
// Browsers drop tabs and newlines inside URLs and read a backslash as a slash, so a value
// holding any of them can resolve differently from how it reads.
// oxlint-disable-next-line no-control-regex -- matching control characters is the point
const UNSAFE = /[\u0000-\u001F\u007F\\]/

/** Whether a path taken from a URL stays on this site once a browser resolves it. */
export const isInternalPath = (value: unknown): value is string => {
  if (typeof value !== "string" || !value.startsWith("/") || UNSAFE.test(value)) {
    return false
  }

  return URL.canParse(value, BASE) && new URL(value, BASE).origin === BASE
}

/** The value when it is an internal path, the fallback otherwise. */
export const toInternalPath = (value: unknown, fallback = "/") =>
  isInternalPath(value) ? value : fallback

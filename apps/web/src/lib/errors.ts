import { m } from "@/paraglide/messages"

export const getErrorMessage = (error: unknown, messages: Record<string, () => string> = {}) => {
  if (typeof error !== "object" || error === null) {
    return m.error_generic()
  }

  const candidate = error as { name?: unknown; code?: unknown; message?: unknown }

  if (candidate.name !== "ApiError" || typeof candidate.code !== "string") {
    return m.error_generic()
  }

  return (
    messages[candidate.code]?.() ??
    (typeof candidate.message === "string" ? candidate.message : m.error_generic())
  )
}

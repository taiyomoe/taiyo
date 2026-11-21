import { API_ERROR_MESSAGES, AUTH_ERROR_MESSAGES } from "@/lib/error-messages"
import { m } from "@/paraglide/messages"

type Messages = Record<string, () => string>

const apiMessages: Messages = API_ERROR_MESSAGES
// For a code nobody knows: an api older or newer than this page, or a proxy answering instead.
const statusMessages: Record<number, () => string> = {
  0: m.error_network,
  400: m.error_api_bad_request,
  401: m.error_api_unauthorized,
  403: m.error_api_forbidden,
  404: m.error_api_not_found,
  409: m.error_api_conflict,
  413: m.error_api_payload_too_large,
  422: m.error_api_validation_error,
  429: m.auth_error_rate_limited,
  502: m.error_unavailable,
  503: m.error_unavailable,
  504: m.error_unavailable,
}

export const getCodeMessage = (
  { code, status }: { code?: string | undefined; status?: number | undefined },
  messages: Messages = {},
) => {
  const byCode =
    code === undefined
      ? undefined
      : (messages[code] ?? apiMessages[code] ?? AUTH_ERROR_MESSAGES[code])
  const byStatus =
    status === undefined
      ? undefined
      : (statusMessages[status] ?? (status >= 500 ? m.error_server : undefined))

  return (byCode ?? byStatus ?? m.error_generic)()
}

// fetch rejects with a TypeError when the request never gets an answer, worded per browser.
const isNetworkError = (error: unknown) =>
  error instanceof TypeError && /fetch|network|load failed/i.test(error.message)

export const getErrorMessage = (error: unknown, messages: Messages = {}) => {
  if (isNetworkError(error)) {
    return m.error_network()
  }

  if (typeof error !== "object" || error === null) {
    return m.error_generic()
  }

  const candidate = error as { name?: unknown; code?: unknown; status?: unknown }

  if (candidate.name !== "ApiError" || typeof candidate.code !== "string") {
    return m.error_generic()
  }

  return getCodeMessage(
    {
      code: candidate.code,
      status: typeof candidate.status === "number" ? candidate.status : undefined,
    },
    messages,
  )
}

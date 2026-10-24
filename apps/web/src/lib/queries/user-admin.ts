import { authClient } from "@taiyomoe/auth/client"
import { config } from "@taiyomoe/config"
import { queryOptions } from "@tanstack/react-query"
import { getAuthErrorMessage } from "@/lib/auth"
import { ApiError } from "@/lib/envelope"
import { m } from "@/paraglide/messages"

type AuthResponse<T> = {
  data: T | null
  error: { code?: string | undefined; status: number } | null
}

const MESSAGES: Record<string, () => string> = {
  FORBIDDEN_TARGET: m.user_admin_forbidden,
  BANNED_USER: m.user_admin_banned,
  PASSWORD_TOO_SHORT: () => m.user_admin_password_short({ min: config.auth.password.minLength }),
  PASSWORD_TOO_LONG: () => m.user_admin_password_long({ max: config.auth.password.maxLength }),
}

export const unwrapAuth = async <T>(request: Promise<AuthResponse<T>>) => {
  const { data, error } = await request

  if (error !== null || data === null) {
    const code = error?.code ?? "AUTH_ERROR"
    const message = MESSAGES[code]?.() ?? getAuthErrorMessage(error ?? { status: 500 })

    throw new ApiError({ success: false, code, message }, error?.status ?? 500)
  }

  return data
}

export const sessionsKey = (userId: string) => ["users", userId, "sessions"] as const

export const userSessionsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: sessionsKey(userId),
    queryFn: async () => (await unwrapAuth(authClient.admin.listUserSessions({ userId }))).sessions,
  })

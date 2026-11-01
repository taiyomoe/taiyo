import type { QueryClient } from "@tanstack/react-query"
import { m } from "../paraglide/messages"
import { sessionQueryOptions } from "./session"

export type SocialProvider = "discord" | "google"

export type AuthError = { code?: string | undefined; status: number }

type AuthResponse = { error: AuthError | null }

export type AuthClient = {
  signIn: {
    email: (body: {
      email: string
      password: string
      rememberMe: boolean
      callbackURL: string
    }) => Promise<AuthResponse>
    social: (body: { provider: SocialProvider; callbackURL: string }) => Promise<AuthResponse>
  }
  signUp: {
    email: (
      body: { name: string; email: string; password: string; callbackURL: string },
      options: { headers: Record<string, string> },
    ) => Promise<AuthResponse>
  }
  signOut: () => Promise<AuthResponse>
}

export type AuthRouter = {
  invalidate: () => Promise<void>
  navigate: (options: { href: string }) => Promise<void>
}

export type AuthResult = { ok: true } | { ok: false; message: string }

const messagesByCode: Record<string, () => string> = {
  INVALID_EMAIL_OR_PASSWORD: m.auth_error_invalid_credentials,
  EMAIL_NOT_VERIFIED: m.auth_error_email_not_verified,
  USER_ALREADY_EXISTS: m.auth_error_email_taken,
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: m.auth_error_email_taken,
  MISSING_RESPONSE: m.auth_error_captcha,
  VERIFICATION_FAILED: m.auth_error_captcha,
}

export const getAuthErrorMessage = (error: AuthError) => {
  if (error.status === 429) {
    return m.auth_error_rate_limited()
  }

  const message = error.code === undefined ? undefined : messagesByCode[error.code]

  return message === undefined ? m.auth_error_generic() : message()
}

const toResult = ({ error }: AuthResponse): AuthResult =>
  error === null ? { ok: true } : { ok: false, message: getAuthErrorMessage(error) }

export const createAuthActions = ({
  client,
  queryClient,
  router,
  callbackURL = "/",
}: {
  client: AuthClient
  queryClient: QueryClient
  router: AuthRouter
  callbackURL?: string | undefined
}) => {
  const refreshSession = async () => {
    queryClient.removeQueries({ queryKey: sessionQueryOptions.queryKey })
    await router.invalidate()
  }

  return {
    signIn: async (values: { email: string; password: string; rememberMe: boolean }) => {
      const result = toResult(await client.signIn.email({ ...values, callbackURL }))

      if (result.ok) {
        await refreshSession()
        await router.navigate({ href: callbackURL })
      }

      return result
    },
    signUp: async (
      values: { name: string; email: string; password: string },
      { captchaToken }: { captchaToken: string | null },
    ) =>
      toResult(
        await client.signUp.email(
          { ...values, callbackURL },
          {
            headers:
              captchaToken !== null && captchaToken !== ""
                ? { "x-captcha-response": captchaToken }
                : {},
          },
        ),
      ),
    signInSocial: async (provider: SocialProvider) =>
      toResult(await client.signIn.social({ provider, callbackURL })),
    signOut: async () => {
      const result = toResult(await client.signOut())

      if (result.ok) {
        await refreshSession()
      }

      return result
    },
  }
}

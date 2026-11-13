import type { QueryClient } from "@tanstack/react-query"
import { m } from "../paraglide/messages"
import { sessionQueryOptions } from "./session"

export type SocialProvider = "discord" | "google"

export type AuthError = { code?: string | undefined; status: number }

type AuthResponse = { error: AuthError | null }

type TwoFactorBody = { code: string; trustDevice: boolean }

export type AuthClient = {
  signIn: {
    email: (body: {
      email: string
      password: string
      rememberMe: boolean
      callbackURL: string
    }) => Promise<AuthResponse & { data?: unknown }>
    social: (body: { provider: SocialProvider; callbackURL: string }) => Promise<AuthResponse>
  }
  signUp: {
    email: (
      body: { name: string; email: string; password: string; callbackURL: string },
      options: { headers: Record<string, string> },
    ) => Promise<AuthResponse>
  }
  signOut: () => Promise<AuthResponse>
  requestPasswordReset: (
    body: { email: string; redirectTo: string },
    options: { headers: Record<string, string> },
  ) => Promise<AuthResponse>
  resetPassword: (body: { newPassword: string; token: string }) => Promise<AuthResponse>
  twoFactor: {
    verifyTotp: (body: TwoFactorBody) => Promise<AuthResponse>
    verifyBackupCode: (body: TwoFactorBody) => Promise<AuthResponse>
  }
}

export type AuthRouter = {
  invalidate: () => Promise<void>
  navigate: (options: { href: string }) => Promise<void>
}

export type AuthResult = { ok: true; twoFactor?: true } | { ok: false; message: string }

const messagesByCode: Record<string, () => string> = {
  INVALID_EMAIL_OR_PASSWORD: m.auth_error_invalid_credentials,
  EMAIL_NOT_VERIFIED: m.auth_error_email_not_verified,
  USER_ALREADY_EXISTS: m.auth_error_email_taken,
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: m.auth_error_email_taken,
  INVALID_CODE: m.user_settings_2fa_invalid_code,
  INVALID_BACKUP_CODE: m.user_settings_2fa_invalid_backup_code,
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: m.user_settings_2fa_too_many_attempts,
  ACCOUNT_TEMPORARILY_LOCKED: m.user_settings_2fa_locked,
  INVALID_TWO_FACTOR_COOKIE: m.user_settings_2fa_expired,
  MISSING_RESPONSE: m.auth_error_captcha,
  VERIFICATION_FAILED: m.auth_error_captcha,
  INVALID_TOKEN: m.auth_error_reset_link_invalid,
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
const captchaHeaders = (captchaToken: string | null) =>
  captchaToken !== null && captchaToken !== "" ? { "x-captcha-response": captchaToken } : {}
const needsTwoFactor = (data: unknown) =>
  typeof data === "object" &&
  data !== null &&
  "twoFactorRedirect" in data &&
  data.twoFactorRedirect === true

export const createAuthActions = ({
  client,
  queryClient,
  router,
  callbackURL = "/",
  getOrigin = () => window.location.origin,
}: {
  client: AuthClient
  queryClient: QueryClient
  router: AuthRouter
  callbackURL?: string | undefined
  getOrigin?: () => string
}) => {
  // Better Auth runs on the api's origin and resolves a relative callbackURL against it,
  // so the redirects it issues (social sign-in, verification links) would land on the
  // api. Resolved when an action runs: the hook also renders on the server.
  const authCallbackURL = () => new URL(callbackURL, getOrigin()).href
  const refreshSession = async () => {
    queryClient.removeQueries({ queryKey: sessionQueryOptions.queryKey })
    await router.invalidate()
  }
  const finishSignIn = async (result: AuthResult) => {
    if (result.ok) {
      await refreshSession()
      await router.navigate({ href: callbackURL })
    }

    return result
  }

  return {
    signIn: async (values: { email: string; password: string; rememberMe: boolean }) => {
      const response = await client.signIn.email({ ...values, callbackURL: authCallbackURL() })

      if (response.error === null && needsTwoFactor(response.data)) {
        return { ok: true, twoFactor: true } satisfies AuthResult
      }

      return finishSignIn(toResult(response))
    },
    verifyTwoFactor: async ({
      code,
      backup,
      trustDevice,
    }: {
      code: string
      backup: boolean
      trustDevice: boolean
    }) =>
      finishSignIn(
        toResult(
          await (backup
            ? client.twoFactor.verifyBackupCode({ code, trustDevice })
            : client.twoFactor.verifyTotp({ code, trustDevice })),
        ),
      ),
    signUp: async (
      values: { name: string; email: string; password: string },
      { captchaToken }: { captchaToken: string | null },
    ) =>
      toResult(
        await client.signUp.email(
          { ...values, callbackURL: authCallbackURL() },
          { headers: captchaHeaders(captchaToken) },
        ),
      ),
    requestPasswordReset: async (
      email: string,
      { captchaToken, redirectTo }: { captchaToken: string | null; redirectTo: string },
    ) =>
      toResult(
        await client.requestPasswordReset(
          { email, redirectTo },
          { headers: captchaHeaders(captchaToken) },
        ),
      ),
    resetPassword: async (values: { newPassword: string; token: string }) =>
      toResult(await client.resetPassword(values)),
    signInSocial: async (provider: SocialProvider) =>
      toResult(await client.signIn.social({ provider, callbackURL: authCallbackURL() })),
    signOut: async () => {
      const result = toResult(await client.signOut())

      if (result.ok) {
        await refreshSession()
      }

      return result
    },
  }
}

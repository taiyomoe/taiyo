import type { QueryClient } from "@tanstack/react-query"
import { m } from "../paraglide/messages"
import { AUTH_ERROR_MESSAGES, SOCIAL_ERROR_MESSAGES } from "./error-messages"
import { getCodeMessage } from "./errors"

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
    social: (body: {
      provider: SocialProvider
      callbackURL: string
      errorCallbackURL: string
    }) => Promise<AuthResponse>
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

const providerNames: Record<SocialProvider, () => string> = {
  google: m.global_google,
  discord: m.global_discord,
}

export const getAuthErrorMessage = (
  error: AuthError,
  messages: Record<string, () => string> = {},
) =>
  // Better Auth's rate limiter answers without a code.
  error.status === 429 ? m.auth_error_rate_limited() : getCodeMessage(error, messages)

export const getSocialErrorMessage = (code: string, provider: SocialProvider | undefined) => {
  const inputs = {
    provider: provider === undefined ? "Google/Discord" : providerNames[provider](),
  }
  const social = SOCIAL_ERROR_MESSAGES[code]

  if (social !== undefined) {
    return social(inputs)
  }

  const message = AUTH_ERROR_MESSAGES[code]

  return message === undefined ? m.auth_error_social_unknown({ ...inputs, code }) : message()
}

const toResult = (
  { error }: AuthResponse,
  messages: Record<string, () => string> = {},
): AuthResult =>
  error === null ? { ok: true } : { ok: false, message: getAuthErrorMessage(error, messages) }
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
  onAccountChange = () => {},
}: {
  client: AuthClient
  queryClient: QueryClient
  router: AuthRouter
  callbackURL?: string | undefined
  getOrigin?: () => string
  onAccountChange?: () => void
}) => {
  // Better Auth runs on the api's origin and resolves a relative callbackURL against it,
  // so the redirects it issues (social sign-in, verification links) would land on the
  // api. Resolved when an action runs: the hook also renders on the server.
  const authCallbackURL = () => new URL(callbackURL, getOrigin()).href
  const refreshSession = async () => {
    onAccountChange()
    await queryClient.cancelQueries()
    queryClient.removeQueries()
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
      toResult(await client.resetPassword(values), {
        INVALID_TOKEN: m.auth_error_reset_link_invalid,
      }),
    signInSocial: async (provider: SocialProvider) => {
      const errorCallbackURL = new URL("/auth/sign-in", getOrigin())

      errorCallbackURL.searchParams.set("provider", provider)

      if (callbackURL !== "/") {
        errorCallbackURL.searchParams.set("redirect", callbackURL)
      }

      return toResult(
        await client.signIn.social({
          provider,
          callbackURL: authCallbackURL(),
          errorCallbackURL: errorCallbackURL.href,
        }),
      )
    },
    signOut: async () => {
      const result = toResult(await client.signOut())

      if (result.ok) {
        await refreshSession()
      }

      return result
    },
  }
}

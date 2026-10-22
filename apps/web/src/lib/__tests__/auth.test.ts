import { QueryClient } from "@tanstack/react-query"
import { describe, expect, it } from "vitest"
import { m } from "../../paraglide/messages"
import { type AuthClient, type AuthError, createAuthActions, getAuthErrorMessage } from "../auth"
import { sessionQueryOptions } from "../queries/session"

const setup = (error: AuthError | null = null, callbackURL?: string) => {
  const calls: Array<{ method: string; args: unknown[] }> = []
  const navigation: string[] = []
  const respond =
    (method: string) =>
    (...args: unknown[]) => {
      calls.push({ method, args })

      return Promise.resolve({ error })
    }
  const client = {
    signIn: { email: respond("signIn.email"), social: respond("signIn.social") },
    signUp: { email: respond("signUp.email") },
    signOut: respond("signOut"),
  } satisfies AuthClient
  const queryClient = new QueryClient()

  queryClient.setQueryData(sessionQueryOptions.queryKey, null)

  const actions = createAuthActions({
    client,
    queryClient,
    router: {
      invalidate: () => {
        navigation.push("invalidate")

        return Promise.resolve()
      },
      navigate: ({ href }) => {
        navigation.push(`navigate ${href}`)

        return Promise.resolve()
      },
    },
    callbackURL,
  })

  return {
    actions,
    calls,
    navigation,
    hasCachedSession: () => queryClient.getQueryState(sessionQueryOptions.queryKey) !== undefined,
  }
}
const credentials = { email: "reader@taiyo.moe", password: "hunter22", rememberMe: true }

describe("createAuthActions", () => {
  it("signs in, drops the cached session and goes home", async () => {
    const { actions, calls, navigation, hasCachedSession } = setup()

    expect(await actions.signIn(credentials)).toEqual({ ok: true })
    expect(calls).toEqual([
      { method: "signIn.email", args: [{ ...credentials, callbackURL: "/" }] },
    ])
    expect(hasCachedSession()).toBe(false)
    expect(navigation).toEqual(["invalidate", "navigate /"])
  })

  it("comes back to the given page after signing in", async () => {
    const { actions, calls, navigation } = setup(null, "/media/1?tab=chapters")

    expect(await actions.signIn(credentials)).toEqual({ ok: true })
    expect(await actions.signInSocial("google")).toEqual({ ok: true })
    expect(calls.map((call) => call.args[0])).toEqual([
      { ...credentials, callbackURL: "/media/1?tab=chapters" },
      { provider: "google", callbackURL: "/media/1?tab=chapters" },
    ])
    expect(navigation).toEqual(["invalidate", "navigate /media/1?tab=chapters"])
  })

  it("leaves the session alone when sign-in fails", async () => {
    const { actions, navigation, hasCachedSession } = setup({
      code: "INVALID_EMAIL_OR_PASSWORD",
      status: 401,
    })

    expect(await actions.signIn(credentials)).toEqual({
      ok: false,
      message: m.auth_error_invalid_credentials(),
    })
    expect(hasCachedSession()).toBe(true)
    expect(navigation).toEqual([])
  })

  it("signs out and drops the cached session", async () => {
    const { actions, navigation, hasCachedSession } = setup()

    expect(await actions.signOut()).toEqual({ ok: true })
    expect(hasCachedSession()).toBe(false)
    expect(navigation).toEqual(["invalidate"])
  })

  it("keeps the session when sign-out fails", async () => {
    const { actions, navigation, hasCachedSession } = setup({ status: 500 })

    expect(await actions.signOut()).toEqual({ ok: false, message: m.auth_error_generic() })
    expect(hasCachedSession()).toBe(true)
    expect(navigation).toEqual([])
  })

  it("sends the captcha token with a sign-up and leaves the session alone", async () => {
    const { actions, calls, navigation, hasCachedSession } = setup()
    const values = { name: "Reader", email: "reader@taiyo.moe", password: "hunter22" }

    expect(await actions.signUp(values, { captchaToken: "token" })).toEqual({ ok: true })
    expect(await actions.signUp(values, { captchaToken: null })).toEqual({ ok: true })
    expect(calls.map((call) => call.args)).toEqual([
      [{ ...values, callbackURL: "/" }, { headers: { "x-captcha-response": "token" } }],
      [{ ...values, callbackURL: "/" }, { headers: {} }],
    ])
    expect(hasCachedSession()).toBe(true)
    expect(navigation).toEqual([])
  })

  it("starts a social sign-in that comes back home", async () => {
    const { actions, calls } = setup()

    expect(await actions.signInSocial("discord")).toEqual({ ok: true })
    expect(calls).toEqual([
      { method: "signIn.social", args: [{ provider: "discord", callbackURL: "/" }] },
    ])
  })
})

describe("getAuthErrorMessage", () => {
  it.each([
    [{ code: "INVALID_EMAIL_OR_PASSWORD", status: 401 }, m.auth_error_invalid_credentials()],
    [{ code: "EMAIL_NOT_VERIFIED", status: 403 }, m.auth_error_email_not_verified()],
    [{ code: "USER_ALREADY_EXISTS", status: 422 }, m.auth_error_email_taken()],
    [{ code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL", status: 422 }, m.auth_error_email_taken()],
    [{ code: "MISSING_RESPONSE", status: 400 }, m.auth_error_captcha()],
    [{ code: "VERIFICATION_FAILED", status: 403 }, m.auth_error_captcha()],
    [{ status: 429 }, m.auth_error_rate_limited()],
    [{ code: "SOMETHING_NEW", status: 400 }, m.auth_error_generic()],
    [{ status: 500 }, m.auth_error_generic()],
  ])("maps %o to a message", (error, message) => {
    expect(getAuthErrorMessage(error)).toBe(message)
  })
})

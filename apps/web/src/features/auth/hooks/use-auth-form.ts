import { useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useAuthRedirect } from "@/features/auth/hooks/use-auth-redirect"
import { useAuthActions } from "@/hooks/use-auth-actions"
import { type AuthResult, getSocialErrorMessage, type SocialProvider } from "@/lib/auth"
import { getErrorMessage } from "@/lib/errors"

export const useAuthForm = () => {
  const actions = useAuthActions(useAuthRedirect())
  const search = useSearch({ from: "/auth" })
  const [error, setError] = useState(() =>
    search.error === undefined ? null : getSocialErrorMessage(search.error, search.provider),
  )
  const [socialPending, setSocialPending] = useState<SocialProvider | null>(null)
  const run = async (action: () => Promise<AuthResult>) => {
    setError(null)

    const result = await action().catch((failure: unknown): AuthResult => ({
      ok: false,
      message: getErrorMessage(failure),
    }))

    if (!result.ok) {
      setError(result.message)
    }

    return result
  }

  // Back from the provider, or from the app Android handed the provider link to, the page
  // is still the one that started the sign-in: without this its buttons stay disabled.
  useEffect(() => {
    const reset = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setSocialPending(null)
      }
    }
    const resetWhenVisible = () => {
      if (document.visibilityState === "visible") {
        setSocialPending(null)
      }
    }

    window.addEventListener("pageshow", reset)
    document.addEventListener("visibilitychange", resetWhenVisible)

    return () => {
      window.removeEventListener("pageshow", reset)
      document.removeEventListener("visibilitychange", resetWhenVisible)
    }
  }, [])

  const onSocial = (provider: SocialProvider) => {
    setSocialPending(provider)
    void run(() => actions.signInSocial(provider)).then((result) => {
      if (!result.ok) {
        setSocialPending(null)
      }
    })
  }

  return {
    error,
    clearError: () => {
      setError(null)
    },
    socialPending,
    onSocial,
    disabled: socialPending !== null,
    signIn: (values: Parameters<typeof actions.signIn>[0]) => run(() => actions.signIn(values)),
    verifyTwoFactor: (values: Parameters<typeof actions.verifyTwoFactor>[0]) =>
      run(() => actions.verifyTwoFactor(values)),
    signUp: (...args: Parameters<typeof actions.signUp>) => run(() => actions.signUp(...args)),
    requestPasswordReset: (...args: Parameters<typeof actions.requestPasswordReset>) =>
      run(() => actions.requestPasswordReset(...args)),
    resetPassword: (values: Parameters<typeof actions.resetPassword>[0]) =>
      run(() => actions.resetPassword(values)),
  }
}

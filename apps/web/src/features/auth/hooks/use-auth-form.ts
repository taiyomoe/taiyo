import { useState } from "react"
import type { AuthResult, SocialProvider } from "@/lib/auth"
import { useAuthRedirect } from "@/features/auth/hooks/use-auth-redirect"
import { useAuthActions } from "@/hooks/use-auth-actions"

export const useAuthForm = () => {
  const actions = useAuthActions(useAuthRedirect())
  const [error, setError] = useState<string | null>(null)
  const [socialPending, setSocialPending] = useState<SocialProvider | null>(null)
  const run = async (action: () => Promise<AuthResult>) => {
    setError(null)

    const result = await action()

    if (!result.ok) {
      setError(result.message)
    }

    return result
  }
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
    signUp: (...args: Parameters<typeof actions.signUp>) => run(() => actions.signUp(...args)),
  }
}

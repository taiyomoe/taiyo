import type { SocialProvider } from "@/components/auth/auth-social-buttons"
import { m } from "@/paraglide/messages"
import { authClient } from "@taiyomoe/auth/client"
import { useState } from "react"

/**
 * The state both auth forms carry: the error banner, which social provider is
 * mid-redirect, and whether anything at all is in flight.
 */
export const useAuthForm = () => {
  const [error, setError] = useState<string | null>(null)
  const [socialPending, setSocialPending] = useState<SocialProvider | null>(null)
  const onSocial = async (provider: SocialProvider) => {
    setError(null)
    setSocialPending(provider)

    await authClient.signIn.social(
      { provider, callbackURL: "/" },
      {
        onError: ({ error }) => {
          setError(error.message || m.auth_error_generic())
          setSocialPending(null)
        },
      },
    )
  }

  return { error, setError, socialPending, onSocial, disabled: socialPending !== null }
}

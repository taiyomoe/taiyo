import type { SocialProvider } from "@/components/auth/auth-social-buttons"
import { m } from "@/paraglide/messages"
import { authClient } from "@taiyomoe/auth/client"
import { useState } from "react"

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

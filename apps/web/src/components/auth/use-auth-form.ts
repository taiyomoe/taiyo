import { authClient } from "@taiyomoe/auth/client"
import { useState } from "react"
import type { SocialProvider } from "@/components/auth/auth-social-buttons"
import { m } from "@/paraglide/messages"

export const useAuthForm = () => {
  const [error, setError] = useState<string | null>(null)
  const [socialPending, setSocialPending] = useState<SocialProvider | null>(null)
  const signInSocial = async (provider: SocialProvider) => {
    setError(null)
    setSocialPending(provider)

    await authClient.signIn.social(
      { provider, callbackURL: "/" },
      {
        onError: ({ error: socialError }) => {
          setError(socialError.message || m.auth_error_generic())
          setSocialPending(null)
        },
      },
    )
  }
  const onSocial = (provider: SocialProvider) => {
    void signInSocial(provider)
  }

  return { error, setError, socialPending, onSocial, disabled: socialPending !== null }
}

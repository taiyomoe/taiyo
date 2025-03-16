import type { InferNestedPaths } from "@taiyomoe/types"
import type { ErrorContext } from "better-auth/react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { authMessages } from "~/utils/auth-messages"

export const useHandleAuthError = () => {
  const t = useTranslations()

  const handleError =
    (defaultMessage: InferNestedPaths<IntlMessages["auth"]>) =>
    ({ error, response }: ErrorContext) => {
      if (response.status === 429) {
        toast.error(t("auth.errors.rateLimitExceeded"))

        return
      }

      toast.error(
        error.code && error.code in authMessages
          ? t(authMessages[error.code as keyof typeof authMessages])
          : t(`auth.${defaultMessage}`),
      )
    }

  return { handleError }
}

import { TRPCClientError } from "@trpc/client"
import { useMessages } from "next-intl"
import { get } from "radash"

export const useErrorHandler = () => {
  const messages = useMessages()

  const handleError =
    (defaultMessage: string, reject?: () => void) => (err: unknown) => {
      reject?.()

      if (err instanceof TRPCClientError) {
        console.log("is trpc erro", err, messages)
        return get(messages, `api.${err.message}`, defaultMessage)
      }

      return defaultMessage
    }

  return { handleError }
}

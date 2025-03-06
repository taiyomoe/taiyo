import { TRPCClientError } from "@trpc/client"
import { useMessages } from "next-intl"
import { get } from "radash"
import { toast } from "sonner"

export const useErrorHandler = () => {
  const messages = useMessages()

  const handleError =
    (defaultMessage: string, reject?: () => void) => (err: unknown) => {
      reject?.()

      if (err instanceof TRPCClientError) {
        return get(messages, `api.${err.message}`, defaultMessage)
      }

      return defaultMessage
    }

  const handleErrorRaw = (
    err: unknown,
    defaultMessage: string,
    toastId: string | number,
  ) => {
    const message = handleError(defaultMessage)(err)

    toast.error(message, { id: toastId })
  }

  return { handleError, handleErrorRaw }
}

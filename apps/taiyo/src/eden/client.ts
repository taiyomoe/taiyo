import type { Media, MediaChapter, MediaCover } from "@taiyomoe/db"
import { HttpError } from "@taiyomoe/image-orchestrator"
import type { IOStreamError, ImportMediaEventMessage } from "@taiyomoe/types"
import { mapValues } from "radash"
import SuperJSON from "superjson"
import { env } from "~/env"

export const handleErrors = (defaultMessage: string) => (err: unknown) =>
  err instanceof HttpError ? err.message : defaultMessage

const transformValue = (value: unknown): File | string => {
  if (value instanceof File) {
    return value
  }

  /**
   * This purposefully doesn't check for arrays because we already
   * handle them in the loop below.
   */
  if (typeof value === "object") {
    return JSON.stringify(value)
  }

  return String(value)
}

const createClient =
  <TOutput, TMeta = []>(path: string) =>
  async (data: Record<string, unknown>) => {
    const formData = new FormData()

    for (const [key, value] of Object.entries(data).filter(
      ([, v]) => v !== undefined,
    )) {
      if (Array.isArray(value)) {
        for (const v of value.map(transformValue)) {
          formData.append(key, v)
        }

        continue
      }

      formData.append(key, transformValue(value))
    }

    const res = await fetch(`${env.NEXT_PUBLIC_IO_URL}/${path}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    })
    const body = await res.json()

    if (res.ok) {
      return body as Promise<{ data: TOutput; meta: TMeta }>
    }

    if (body && typeof body === "object" && "errors" in body) {
      const { errors } = body as Record<
        "errors",
        string[] | Record<string, unknown>[]
      >
      const firstError = errors[0]!

      // If the error is a string, we can most likely show it to the user.
      if (typeof firstError === "string") {
        throw new HttpError(res.status, firstError)
      }
    }

    throw new Error("Unknown error")
  }

const createSseClient =
  <TMessage extends Record<string, unknown>>(path: string) =>
  async (
    data: Record<string, string | number | boolean>,
    callbacks: {
      onMessage: (message: TMessage) => void
      onError?: (content: string) => void
      onOpen?: () => void
      onClose?: () => void
    },
  ) => {
    const searchParams = new URLSearchParams(mapValues(data, String)).toString()
    const source = new EventSource(
      `${env.NEXT_PUBLIC_IO_URL}/${path}?${searchParams}`,
      { withCredentials: true },
    )
    let messageCount = 0
    let errorsCount = 0

    source.onmessage = (event) => {
      const message = SuperJSON.parse<TMessage | IOStreamError>(event.data)
      const isError = (msg: typeof message): msg is IOStreamError =>
        "type" in msg && msg.type === "error"

      messageCount++

      if (isError(message)) {
        callbacks.onError?.(message.content)
        errorsCount++

        return
      }

      callbacks.onMessage(message)
    }

    source.onopen = () => {
      callbacks.onOpen?.()
    }

    source.onerror = () => {
      source.close()

      // If we didn't receive any messages, we assume the client couldn't connect
      if (messageCount === 0) {
        callbacks.onError?.("Ocorreu um erro inesperado.")

        return
      }

      if (errorsCount === 0) {
        callbacks.onClose?.()
      }
    }
  }

export const ioApi = {
  medias: {
    create: createClient<Media>("medias"),
    import: createSseClient<ImportMediaEventMessage>("medias/import"),
  },
  covers: {
    upload: createClient<MediaCover>("covers"),
  },
  chapters: {
    upload: createClient<MediaChapter>("chapters"),
  },
}

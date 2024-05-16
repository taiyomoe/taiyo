import type { Media, MediaChapter, MediaCover } from "@taiyomoe/db"
import { HttpError } from "@taiyomoe/image-orchestrator"
import type { ImportMediaEventMessage } from "@taiyomoe/types"

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

    const res = await fetch(`http://localhost:4000/v3/${path}`, {
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
  <TMessage>(path: string) =>
  async (
    data: Record<string, string>,
    {
      onMessage,
      onOpen,
      onClose,
      onError,
    }: {
      onMessage: (message: TMessage) => void
      onOpen?: () => void
      onError?: () => void
      onClose?: () => void
    },
  ) => {
    const searchParams = new URLSearchParams(data).toString()
    const source = new EventSource(
      `http://localhost:4000/v3/${path}?${searchParams}`,
      { withCredentials: true },
    )

    source.onmessage = (event) => {
      onMessage(JSON.parse(event.data) as TMessage)
    }

    source.onopen = () => {
      console.log("open")

      onOpen?.()
    }

    source.onerror = (event) => {
      console.log("close", source.readyState)
      source.close()
      console.log("close", source.readyState)

      if (source.readyState === EventSource.CLOSED) {
        onClose?.()
        return
      }

      console.log("event", event)

      onError?.()
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

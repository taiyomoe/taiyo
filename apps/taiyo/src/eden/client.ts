import type { Media } from "@taiyomoe/db"
import { HttpError } from "@taiyomoe/image-orchestrator"

export const handleErrors = (defaultMessage: string) => (err: unknown) => {
  if (err instanceof HttpError) {
    return err.message
  }

  return defaultMessage
}

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
      const { errors } = body as Record<"errors", string[]>

      throw new HttpError(res.status, errors[0]!)
    }

    throw new Error("Unknown error")
  }

export const ioApi = {
  medias: {
    create: createClient<Media>("medias"),
  },
}

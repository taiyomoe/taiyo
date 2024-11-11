import type { Media, MediaChapter } from "@taiyomoe/db"
import type { CreateMediaInput, UploadChapterInput } from "@taiyomoe/schemas"
import { env } from "~/env"

class ApiError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)

    this.code = code
  }
}

export const handleErrors = (defaultMessage: string) => (err: unknown) =>
  err instanceof ApiError ? err.message : defaultMessage

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
  <TInput extends Record<string, unknown>, TOutput>(path: string) =>
  async (data: TInput) => {
    const formData = new FormData()

    /**
     * Appends the data to the form data while stringifying everything (except files).
     */
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

    const res = await fetch(`${env.NEXT_PUBLIC_IOV4_URL}/${path}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    })
    const body = await res.json()

    if (res.ok) {
      return body as TOutput
    }

    console.log("Error", body)

    if (body && typeof body === "object" && "code" in body) {
      const { code, message } = body as { code: string; message: string }

      throw new ApiError(code, message)
    }

    throw new Error("Unknown error")
  }

export const ioApi = {
  medias: {
    create: createClient<CreateMediaInput, Media>("medias"),
  },
  chapters: {
    upload: createClient<UploadChapterInput, MediaChapter>("chapters"),
  },
}

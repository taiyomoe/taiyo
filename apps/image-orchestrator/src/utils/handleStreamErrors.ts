import type Stream from "@elysiajs/stream"
import { HttpError } from "./errors"

export const handleStreamErrors =
  (stream: Stream<string | number | boolean | object>) => (error: unknown) => {
    if (error instanceof HttpError) {
      stream.send({
        content: error.message,
        type: "error",
      })
    }

    console.error(error)
  }

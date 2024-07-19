import type Stream from "@elysiajs/stream"
import type { IOStreamError } from "@taiyomoe/types"
import SuperJSON from "superjson"
import { HttpError } from "./errors"

export const sendStream =
  (stream: Stream<string | number | boolean | object>) =>
  (
    step: number,
    content: string,
    type: "ongoing" | "success",
    itemIndex?: number,
  ) => {
    const payload = SuperJSON.stringify({
      step,
      content,
      type,
      itemIndex,
      timestamp: new Date(),
    })

    stream.send(payload)
  }

export const handleStreamErrors =
  (stream: Stream<string | number | boolean | object>) => (error: unknown) => {
    if (error instanceof HttpError) {
      const payload = {
        content: error.message,
        type: "error",
        timestamp: new Date(),
      } satisfies IOStreamError

      stream.send(SuperJSON.stringify(payload))
    }

    console.error(error)
  }

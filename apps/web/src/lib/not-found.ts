import { notFound } from "@tanstack/react-router"

import { getApiErrorCode } from "@/lib/envelope"

export const rethrowAsNotFound =
  (codes: readonly string[]) =>
  (error: unknown): never => {
    const code = getApiErrorCode(error)

    if (code !== undefined && codes.includes(code)) {
      throw notFound()
    }

    throw error
  }

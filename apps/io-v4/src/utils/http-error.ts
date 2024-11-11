import type { StatusCode } from "hono/utils/http-status"
import type { CustomContext } from "~/types"

export class HttpError extends Error {
  status: StatusCode
  i18nKey: Parameters<CustomContext["Variables"]["t"]>[0]

  constructor(
    status: StatusCode,
    key: Parameters<CustomContext["Variables"]["t"]>[0],
  ) {
    super(key)

    this.name = "HttpError"
    this.status = status
    this.i18nKey = key
  }
}

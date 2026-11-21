import { describe, expect, it } from "vitest"
import { m } from "../../paraglide/messages"
import { ApiError } from "../envelope"
import { getErrorMessage } from "../errors"

const apiError = (code: string, status: number) =>
  new ApiError({ success: false, code, message: "English message from the api" }, status)

describe("getErrorMessage", () => {
  it.each([
    [apiError("MEDIA_NOT_FOUND", 404), m.error_api_media_not_found()],
    [apiError("INSUFFICIENT_POINTS", 409), m.shop_error_not_enough()],
    [apiError("TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE", 403), m.user_settings_2fa_too_many_attempts()],
    [apiError("SOMETHING_NEW", 403), m.error_api_forbidden()],
    [apiError("SOMETHING_NEW", 503), m.error_unavailable()],
    [apiError("SOMETHING_NEW", 500), m.error_server()],
    [apiError("SOMETHING_NEW", 418), m.error_generic()],
    [new TypeError("Failed to fetch"), m.error_network()],
    [new TypeError("Load failed"), m.error_network()],
    [new TypeError("x is not a function"), m.error_generic()],
    [null, m.error_generic()],
  ])("maps %o to a message", (error, message) => {
    expect(getErrorMessage(error)).toBe(message)
  })

  it("prefers the caller's message for a code", () => {
    expect(
      getErrorMessage(apiError("USER_NOT_FOUND", 404), {
        USER_NOT_FOUND: m.invite_error_user_not_found,
      }),
    ).toBe(m.invite_error_user_not_found())
  })
})

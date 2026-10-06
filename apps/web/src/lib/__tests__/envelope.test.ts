import { describe, expect, it } from "vitest"
import { ApiError, getApiErrorCode, unwrap, unwrapEnvelope } from "../envelope"

const respond = <TBody>(status: number, body: TBody) => ({
  status,
  json: () => Promise.resolve(body),
})
const success = {
  success: true as const,
  data: [{ id: "a" }, { id: "b" }],
  timestamp: "2026-10-03T00:00:00.000Z",
  requestId: "req-1",
}
const paginated = { ...success, meta: { page: 1, perPage: 20, total: 932 } }
const failure = {
  success: false as const,
  code: "MEDIA_NOT_FOUND",
  message: "The requested media was not found.",
  timestamp: "2026-10-03T00:00:00.000Z",
  requestId: "req-2",
}

describe("unwrap", () => {
  it("returns data on a success envelope", async () => {
    await expect(unwrap(respond(200, success))).resolves.toEqual(success.data)
  })

  it("throws an ApiError carrying the API's code on a failure envelope", async () => {
    await expect(unwrap(respond(404, failure))).rejects.toBeInstanceOf(ApiError)

    const error = await unwrap(respond(404, failure)).catch((e: unknown) => e)

    expect(error).toMatchObject({
      code: "MEDIA_NOT_FOUND",
      message: "The requested media was not found.",
      name: "ApiError",
      status: 404,
    })
  })

  it("carries validation details through when the API sends them", async () => {
    const details = [{ path: ["page"], message: "Too small" }]
    const error = await unwrap(
      respond(422, { ...failure, code: "VALIDATION_ERROR", details }),
    ).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).details).toEqual(details)
  })

  it("discards meta, which is what unwrapEnvelope is for", async () => {
    await expect(unwrap(respond(200, paginated))).resolves.toEqual(paginated.data)
  })
})

describe("unwrapEnvelope", () => {
  it("preserves meta on a paginated envelope", async () => {
    await expect(unwrapEnvelope(respond(200, paginated))).resolves.toEqual(paginated)
  })

  it("returns the whole success envelope, not just data", async () => {
    await expect(unwrapEnvelope(respond(200, success))).resolves.toEqual(success)
  })

  it("throws the same ApiError unwrap does", async () => {
    await expect(unwrapEnvelope(respond(409, failure))).rejects.toBeInstanceOf(ApiError)
  })
})

describe("getApiErrorCode", () => {
  it("returns the code for a thrown ApiError", async () => {
    const error = await unwrap(respond(404, failure)).catch((e: unknown) => e)

    expect(getApiErrorCode(error)).toBe("MEDIA_NOT_FOUND")
  })

  it("returns the code for an ApiError that lost its prototype crossing SSR", () => {
    const serialized = {
      name: "ApiError",
      message: failure.message,
      code: failure.code,
      status: 404,
    }

    expect(getApiErrorCode(serialized)).toBe("MEDIA_NOT_FOUND")
  })

  it("returns undefined for a network failure, which carries no API code", () => {
    expect(getApiErrorCode(new TypeError("Failed to fetch"))).toBeUndefined()
  })

  it("returns undefined for anything that is not an error envelope", () => {
    expect(getApiErrorCode(new Error("boom"))).toBeUndefined()
    expect(getApiErrorCode({ name: "ApiError" })).toBeUndefined()
    expect(getApiErrorCode({ code: "NOT_TAGGED" })).toBeUndefined()
    expect(getApiErrorCode(null)).toBeUndefined()
    expect(getApiErrorCode("MEDIA_NOT_FOUND")).toBeUndefined()
  })
})

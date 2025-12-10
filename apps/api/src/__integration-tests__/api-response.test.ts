import type { Hono } from "hono"
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"
import { app } from "../index"

describe("API Response Standardization", () => {
  let testApp: Hono

  beforeEach(({ task }) => {
    if (task.name === "should include error details in development mode") {
      vi.stubEnv("NODE_ENV", "development")
    }

    if (task.name === "should not include error details in production mode") {
      vi.stubEnv("NODE_ENV", "production")
    }
  })

  beforeAll(() => {
    testApp = app
      .get("/test-get", (c) => {
        return c.ok({ test: "data" })
      })
      .post("/test-post", (c) => {
        return c.ok({ id: "123" })
      })
      .get("/test-error", (c) => {
        return c.fail("NOT_FOUND")
      })
      .get("/test-error-details", (c) => {
        return c.fail("VALIDATION_ERROR", { field: "email", issue: "invalid" })
      })
      .get("/test-error-no-details", (c) => {
        return c.fail("INTERNAL_SERVER_ERROR")
      })
      .get("/test-unauthorized", (c) => c.fail("UNAUTHORIZED"))
      .get("/test-bad-request", (c) => c.fail("BAD_REQUEST"))
      .get("/test-exception", () => {
        throw new Error("Test error message")
      })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe("Success Responses", () => {
    it("should return standardized success response format", async () => {
      const res = await testApp.request("/test-get")
      const json = await res.json()

      expect(json).toMatchObject({
        success: true,
        data: { test: "data" },
        timestamp: expect.any(String),
        requestId: expect.any(String),
      })
    })

    it("should return 201 status for POST requests", async () => {
      const res = await testApp.request("/test-post", {
        method: "POST",
      })

      expect(res.status).toBe(201)
    })

    it("should return 200 status for non-POST requests", async () => {
      const res = await testApp.request("/test-get")

      expect(res.status).toBe(200)
    })
  })

  describe("Error Responses", () => {
    it("should return standardized error response format", async () => {
      const res = await testApp.request("/test-error")
      const json = await res.json()

      expect(json).toMatchObject({
        success: false,
        code: expect.any(String),
        message: expect.any(String),
        timestamp: expect.any(String),
        requestId: expect.any(String),
      })
    })

    it("should include details when provided", async () => {
      const res = await testApp.request("/test-error-details")
      const json = await res.json()

      expect(json).toMatchObject({
        details: {
          field: "email",
          issue: "invalid",
        },
      })
    })

    it("should not include details when not provided", async () => {
      const res = await testApp.request("/test-error-no-details")
      const json = await res.json()

      expect(json).not.toHaveProperty("details")
    })

    it("should return correct status code and error messages for different error types", async () => {
      const unauthorizedReq = await testApp.request("/test-unauthorized")
      const badRequestReq = await testApp.request("/test-bad-request")
      const unauthorizedJson = await unauthorizedReq.json()
      const badRequestJson = await badRequestReq.json()

      expect(unauthorizedReq.status).toBe(401)
      expect(unauthorizedJson).toMatchObject({
        success: false,
        code: "UNAUTHORIZED",
        message: "Authentication is required to access this resource.",
      })
      expect(badRequestReq.status).toBe(400)
      expect(badRequestJson).toMatchObject({
        success: false,
        code: "BAD_REQUEST",
        message: "The request is invalid or malformed.",
      })
    })

    it("should catch uncaught exceptions and return standardized error", async () => {
      const res = await testApp.request("/test-exception")
      const json = await res.json()

      expect(res.status).toBe(500)
      expect(json).toMatchObject({
        success: false,
        code: expect.any(String),
        message: expect.any(String),
        timestamp: expect.any(String),
        requestId: expect.any(String),
        details: expect.any(Object),
      })
    })

    it("should include error details in development mode", async () => {
      const res = await testApp.request("/test-exception")
      const json = await res.json()

      expect(res.status).toBe(500)
      expect(json).toMatchObject({
        details: {
          error: "Test error message",
          stack: expect.any(String),
        },
      })
    })

    it("should not include error details in production mode", async () => {
      const res = await testApp.request("/test-exception")
      const json = await res.json()

      expect(res.status).toBe(500)
      expect(json).not.toHaveProperty("details")
    })
  })
})

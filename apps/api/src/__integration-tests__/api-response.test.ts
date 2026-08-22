import type { Hono } from "hono"
import { afterEach, beforeEach, describe, expect, vi } from "vitest"
import z from "zod"
import { validateFormData } from "../middlewares/validate-form-data-middleware"
import { test } from "./setup"

const getTestApp = (app: Hono): Hono =>
  app
    .get("/test-get", (c) => c.ok({ test: "data" }))
    .post("/test-post", (c) => c.ok({ id: "123" }))
    .get("/test-error", (c) => c.fail("NOT_FOUND"))
    .get("/test-error-details", (c) =>
      c.fail("VALIDATION_ERROR", { field: "email", issue: "invalid" }),
    )
    .get("/test-error-no-details", (c) => c.fail("INTERNAL_SERVER_ERROR"))
    .get("/test-unauthorized", (c) => c.fail("UNAUTHORIZED"))
    .get("/test-bad-request", (c) => c.fail("BAD_REQUEST"))
    .get("/test-exception", () => {
      throw new Error("Test error message")
    })
    .post(
      "/test-validation",
      validateFormData(z.object({ name: z.string().min(1), email: z.email() })),
      (c) => {
        const data = c.get("formData")

        return c.ok(data)
      },
    )

describe("API Response Standardization", () => {
  beforeEach(({ task }) => {
    if (task.name === "should include error details in development mode") {
      vi.stubEnv("NODE_ENV", "development")
    }

    if (task.name === "should not include error details in production mode") {
      vi.stubEnv("NODE_ENV", "production")
    }
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe("Success Responses", () => {
    test("should return standardized success response format", async ({ app }) => {
      const testApp = getTestApp(app)
      const res = await testApp.request("/test-get")
      const json = await res.json()

      expect(json).toMatchObject({
        success: true,
        data: { test: "data" },
        timestamp: expect.any(String),
        requestId: expect.any(String),
      })
    })

    test("should return 201 status for POST requests", async ({ app }) => {
      const testApp = getTestApp(app)
      const res = await testApp.request("/test-post", { method: "POST" })

      expect(res.status).toBe(201)
    })

    test("should return 200 status for non-POST requests", async ({ app }) => {
      const testApp = getTestApp(app)
      const res = await testApp.request("/test-get")

      expect(res.status).toBe(200)
    })
  })

  describe("Error Responses", () => {
    test("should return standardized error response format", async ({ app }) => {
      const testApp = getTestApp(app)
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

    test("should include details when provided", async ({ app }) => {
      const testApp = getTestApp(app)
      const res = await testApp.request("/test-error-details")
      const json = await res.json()

      expect(json).toMatchObject({
        details: { field: "email", issue: "invalid" },
      })
    })

    test("should not include details when not provided", async ({ app }) => {
      const testApp = getTestApp(app)
      const res = await testApp.request("/test-error-no-details")
      const json = await res.json()

      expect(json).not.toHaveProperty("details")
    })

    test("should return correct status code and error messages for different error types", async ({
      app,
    }) => {
      const testApp = getTestApp(app)
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

    test("should catch uncaught exceptions and return standardized error", async ({ app }) => {
      const testApp = getTestApp(app)
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

    test("should include error details in development mode", async ({ app }) => {
      const testApp = getTestApp(app)
      const res = await testApp.request("/test-exception")
      const json = await res.json()

      expect(res.status).toBe(500)
      expect(json).toMatchObject({
        details: { error: "Test error message", stack: expect.any(String) },
      })
    })

    test("should not include error details in production mode", async ({ app }) => {
      const testApp = getTestApp(app)
      const res = await testApp.request("/test-exception")
      const json = await res.json()

      expect(res.status).toBe(500)
      expect(json).not.toHaveProperty("details")
    })
  })

  describe("Form Data Validation", () => {
    test("should return validated data on successful validation", async ({ app }) => {
      const testApp = getTestApp(app)
      const formData = new FormData()

      formData.append("name", "John Doe")
      formData.append("email", "john@example.com")

      const res = await testApp.request("/test-validation", { method: "POST", body: formData })
      const json = await res.json()

      expect(res.status).toBe(201)
      expect(json).toMatchObject({
        success: true,
        data: { name: "John Doe", email: "john@example.com" },
      })
    })

    test("should return validation error with details on failed validation", async ({ app }) => {
      const testApp = getTestApp(app)
      const formData = new FormData()

      formData.append("name", "")
      formData.append("email", "invalid-email")

      const res = await testApp.request("/test-validation", { method: "POST", body: formData })
      const json = (await res.json()) as {
        details: { path: string[]; code: string }[]
      }

      expect(res.status).toBe(422)
      expect(json).toMatchObject({
        success: false,
        code: "VALIDATION_ERROR",
        message: "The request data failed validation.",
        details: expect.arrayContaining([
          expect.objectContaining({ path: ["name"], code: "too_small" }),
          expect.objectContaining({ path: ["email"], code: "invalid_format" }),
        ]),
      })
    })
  })
})

import { describe, expect } from "vitest"
import z from "zod"
import { test } from "./setup"

const specSchema = z.object({
  tags: z.object({ name: z.string() }).array(),
  paths: z.record(
    z.string(),
    z.record(
      z.string(),
      z.object({
        summary: z.string(),
        description: z.string(),
        tags: z.string().array(),
        parameters: z
          .object({ in: z.string(), name: z.string(), description: z.string().optional() })
          .array()
          .default([]),
        responses: z.record(z.string(), z.object({ description: z.string() })),
      }),
    ),
  ),
})
const ACCESS_FOOTER = /\n\n\*\*(Authentication|Required roles|Required access):\*\* [^\n]+\.$/
const getSpec = async (app: { request: (path: string) => Response | Promise<Response> }) => {
  const spec = specSchema.parse(await (await app.request("/openapi.json")).json())
  const operations = Object.entries(spec.paths).flatMap(([path, methods]) =>
    Object.entries(methods).map(([method, operation]) => ({
      ...operation,
      path,
      name: `${method.toUpperCase()} ${path}`,
    })),
  )

  return { tags: new Set(spec.tags.map((tag) => tag.name)), operations }
}

describe("GET /openapi.json", () => {
  test("describes every operation in the same format", async ({ app }) => {
    const { tags, operations } = await getSpec(app)

    for (const operation of operations) {
      expect.soft(operation.summary, operation.name).toMatch(/^[A-Z][^\n]*[^.]$/)
      expect.soft(operation.description, operation.name).toMatch(ACCESS_FOOTER)
      expect.soft(operation.tags, operation.name).toHaveLength(1)
      expect.soft(tags, operation.name).toContain(operation.tags[0])

      for (const [status, response] of Object.entries(operation.responses)) {
        expect.soft(response.description, `${operation.name} ${status}`).toMatch(/\.$/)
      }
    }
  })

  test("lists 401 and 403 on the operations that need a session, and only there", async ({
    app,
  }) => {
    const { operations } = await getSpec(app)
    const isPublic = (description: string) => description.endsWith("**Authentication:** none.")
    const isOptional = (description: string) =>
      description.endsWith("**Authentication:** optional.")

    expect(
      operations
        .filter((operation) => isPublic(operation.description) && "401" in operation.responses)
        .map((operation) => operation.name),
    ).toEqual([])
    expect(
      operations
        .filter(
          (operation) =>
            !isPublic(operation.description) &&
            !isOptional(operation.description) &&
            !("401" in operation.responses && "403" in operation.responses),
        )
        .map((operation) => operation.name),
    ).toEqual([])
  })

  test("documents every path parameter", async ({ app }) => {
    const { operations } = await getSpec(app)

    for (const operation of operations) {
      const inPath = [...operation.path.matchAll(/\{(\w+)\}/g)].map((match) => match[1])
      const documented = operation.parameters
        .filter((parameter) => parameter.in === "path")
        .map((parameter) => parameter.name)

      expect.soft(new Set(documented), operation.name).toEqual(new Set(inPath))
    }
  })

  test("describes every parameter", async ({ app }) => {
    const { operations } = await getSpec(app)

    for (const operation of operations) {
      for (const parameter of operation.parameters) {
        expect.soft(parameter.description, `${operation.name} ${parameter.name}`).toBeDefined()
      }
    }
  })
})

import { describe, expect } from "vitest"
import { app } from "../index"
import { test } from "./setup"

describe("POST /medias", () => {
  test("should exist", async () => {
    const response = await app
      .handle(new Request("http://localhost:3001/medias", { method: "POST" }))
      .then((x) => x.json())

    expect(response).toBeDefined()
  })
})

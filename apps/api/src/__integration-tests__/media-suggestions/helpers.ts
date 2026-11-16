import type { Hono } from "hono"
import { expect } from "vitest"
import type { Services } from "../../services"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia, seedTitle } from "../helpers/seed"

export type BulkResult = { done: string[]; skipped: Array<{ id: string; reason: string }> }

/** A media with a main title and an English synopsis, ready for suggestions. */
export const getMedia = async (services: Services, creatorId: string) => {
  const mediaId = await seedMedia(services, creatorId)

  await seedTitle(services, { mediaId, creatorId, title: "Main", isMainTitle: true })
  await services.db
    .updateTable("medias")
    .set({ synopsis: { en: "Old synopsis." } })
    .where("id", "=", mediaId)
    .execute()

  return mediaId
}

export const getSuggestionId = async (
  app: Hono,
  mediaId: string,
  headers: Record<string, string>,
  changes: Record<string, unknown>,
) => {
  const res = await api<{ id: string }>(app, `/medias/${mediaId}/suggestions`, {
    method: "POST",
    headers,
    json: { changes },
  })

  if (!res.body.success) {
    throw new Error(`Expected a created suggestion: ${JSON.stringify(res.body)}`)
  }

  return res.body.data.id
}

export const getReviewer = (services: Services) => signInAs(services, { role: "UPLOADER" })

export const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

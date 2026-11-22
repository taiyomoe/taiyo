import type { Hono } from "hono"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { type ApiResult, api } from "../helpers/request"

export const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"

export const BODY = `${"A slow start that pays off. ".repeat(8)}The ending lands.`

export type Review = {
  id: string
  mediaId: string
  body: string
  containsSpoilers: boolean
  helpfulCount: number
  score: number | null
  createdAt: string
  editedAt: string | null
  author: { id: string; username: string }
  viewer: { voted: boolean; canEdit: boolean; canDelete: boolean; canReport: boolean } | null
}

export const rate = (
  app: Hono,
  headers: Record<string, string>,
  score: number,
  mediaId = SEEDED_MEDIA_ID,
) => api(app, `/medias/${mediaId}/rating`, { method: "PUT", headers, json: { score } })

export const writeReview = (
  app: Hono,
  headers: Record<string, string>,
  json: { body?: unknown; containsSpoilers?: boolean } = {},
  mediaId = SEEDED_MEDIA_ID,
) =>
  api<Review>(app, `/medias/${mediaId}/review`, {
    method: "PUT",
    headers,
    json: { body: BODY, ...json },
  })

/** Signs a new user in, rates the media and reviews it. */
export const reviewer = async (
  app: Hono,
  services: Services,
  { score = 8, mediaId = SEEDED_MEDIA_ID, body = BODY } = {},
) => {
  const user = await signInAs(services)

  await rate(app, user.headers, score, mediaId)

  const res = await writeReview(app, user.headers, { body }, mediaId)

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return { ...user, review: res.body.data }
}

/** The status and error code of a failed response, to compare in one assertion. */
export const failure = (res: ApiResult) => ({
  status: res.status,
  code: res.body.success ? null : res.body.code,
})

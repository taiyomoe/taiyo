import { config } from "@taiyomoe/config"
import {
  countReviewCharacters,
  countReviewCodePoints,
  normalizeReviewBody,
} from "@taiyomoe/schemas/review-body"
import { z } from "zod"

const { minBodyLength, maxBodyLength } = config.reviews

/** How a body measures against the limits, counted the way the server counts it once saved. */
export const measureReviewBody = (body: string) => {
  const normalized = normalizeReviewBody(body)
  const characters = countReviewCharacters(normalized)
  const length = countReviewCodePoints(normalized)

  return {
    normalized,
    length,
    missing: Math.max(0, minBodyLength - characters),
    excess: Math.max(0, length - maxBodyLength),
    valid: characters >= minBodyLength && length <= maxBodyLength,
  }
}

const draftSchema = z.object({ body: z.string(), containsSpoilers: z.boolean() })

export type ReviewDraft = z.infer<typeof draftSchema>

const draftKey = (userId: string, mediaId: string) => `taiyo:review-draft:${userId}:${mediaId}`

/** The draft left in this browser, if any. Storage can be full, blocked or tampered with. */
export const loadReviewDraft = (userId: string, mediaId: string): ReviewDraft | null => {
  try {
    const raw = localStorage.getItem(draftKey(userId, mediaId))
    const parsed = raw === null ? null : draftSchema.safeParse(JSON.parse(raw))

    return parsed?.success === true ? parsed.data : null
  } catch {
    return null
  }
}

export const saveReviewDraft = (userId: string, mediaId: string, draft: ReviewDraft) => {
  try {
    localStorage.setItem(draftKey(userId, mediaId), JSON.stringify(draft))
  } catch {
    // A draft that can't be kept is only lost on reload.
  }
}

export const clearReviewDraft = (userId: string, mediaId: string) => {
  try {
    localStorage.removeItem(draftKey(userId, mediaId))
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}

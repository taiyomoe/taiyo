import { sanitizeUserText } from "./comment-content"

const INVISIBLE = /[­ᅟᅠ​‌⁠⠀ㅤ﻿]/gu

/** Plain text with line breaks: control characters out, trailing spaces trimmed, at most one blank line in a row. */
export const normalizeReviewBody = (body: string) =>
  sanitizeUserText(body)
    .replace(/[^\S\n]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

const SURROGATE_PAIR = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g

/** The length the maximum applies to: code points, as Postgres' `char_length` counts them. */
export const countReviewCodePoints = (body: string) => body.replace(SURROGATE_PAIR, "_").length

/** The length the minimum applies to: code points, without the invisible ones that pad a body out. */
export const countReviewCharacters = (body: string) =>
  countReviewCodePoints(body.replace(INVISIBLE, ""))

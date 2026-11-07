const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"

export const COMMENT_IMAGE_LINE = new RegExp(
  `^[^\\S\\n]*(\\|\\|)?!\\[\\]\\(image:(${UUID})\\)\\1[^\\S\\n]*$`,
)

const COMMENT_IMAGE_LINES = new RegExp(COMMENT_IMAGE_LINE.source, "gm")

export const commentImageToken = (id: string, spoiler = false) =>
  spoiler ? `||![](image:${id})||` : `![](image:${id})`

export const parseCommentImageLine = (line: string) => {
  const match = COMMENT_IMAGE_LINE.exec(line)

  return match === null ? null : { id: match[2] ?? "", spoiler: match[1] !== undefined }
}

export const getCommentImageIds = (content: string) =>
  [...content.matchAll(COMMENT_IMAGE_LINES)].map((match) => match[2] ?? "")

export const getCommentText = (content: string) => content.replace(COMMENT_IMAGE_LINES, "").trim()

const BLANK = /^[\s­ᅟᅠ​-‍⁠⠀ㅤ﻿]*$/u

export const sanitizeUserText = (text: string) =>
  text
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "\uFFFD")
    .replace(/\r\n?/g, "\n")
    .replace(/[^\P{Cc}\n\t]/gu, "")

export const normalizeCommentContent = (content: string) =>
  sanitizeUserText(content)
    .replace(/[^\S\n]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

export const isBlankCommentText = (content: string) => BLANK.test(getCommentText(content))

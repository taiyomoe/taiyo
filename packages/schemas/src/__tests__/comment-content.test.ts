import { describe, expect, it } from "vitest"
import {
  commentImageToken,
  getCommentImageIds,
  getCommentText,
  isBlankCommentText,
  normalizeCommentContent,
  parseCommentImageLine,
} from "../comment-content"

const ID = "7f0c6a8e-1b2c-4d3e-8f90-123456789abc"

describe("comment image tokens", () => {
  it("round-trips plain and spoiler tokens", () => {
    expect(parseCommentImageLine(commentImageToken(ID))).toEqual({ id: ID, spoiler: false })
    expect(parseCommentImageLine(commentImageToken(ID, true))).toEqual({ id: ID, spoiler: true })
  })

  it("only counts tokens alone on their line", () => {
    const content = `before ![](image:${ID})\n  ![](image:${ID})  \n||![](image:${ID})\n||![](image:${ID})||`

    expect(getCommentImageIds(content)).toEqual([ID, ID])
  })

  it("rejects malformed ids and half spoilers", () => {
    expect(parseCommentImageLine("![](image:not-a-uuid)")).toBeNull()
    expect(parseCommentImageLine(`||![](image:${ID})`)).toBeNull()
    expect(parseCommentImageLine(`![alt](image:${ID})`)).toBeNull()
  })

  it("measures text without the image lines", () => {
    expect(getCommentText(`hi\n![](image:${ID})\nthere`)).toBe("hi\n\nthere")
    expect(isBlankCommentText(`![](image:${ID})\n​`)).toBe(true)
  })
})

describe("normalizeCommentContent", () => {
  it("normalizes line endings, trailing spaces and blank runs", () => {
    expect(normalizeCommentContent("  a  \r\n\r\n\r\n\r\nb\t\n")).toBe("a\n\nb")
  })

  it("drops control characters and repairs lone surrogates", () => {
    expect(normalizeCommentContent("a\u0000b\u0007c\u001Bd\te")).toBe("abcd\te")
    expect(normalizeCommentContent("x\uD800y")).toBe("x\uFFFDy")
  })
})

import { COMMENT_IMAGE_LINE } from "@taiyomoe/schemas/comment-content"

export type RichTextMark = "bold" | "italic" | "underline" | "strike" | "spoiler" | "link" | "image"

type RichTextSegment = {
  start: number
  end: number
  marks: RichTextMark[]
  syntax: boolean
}

const DELIMITERS = [
  { token: "**", mark: "bold" },
  { token: "__", mark: "underline" },
  { token: "~~", mark: "strike" },
  { token: "||", mark: "spoiler" },
  { token: "*", mark: "italic" },
  { token: "_", mark: "italic" },
] as const
const MAX_DEPTH = 6
const MAX_CLOSER_ATTEMPTS = 16
const ESCAPABLE = /[!-/:-@[-`{-~]/
const WORD = /[\p{L}\p{N}]/u
const SPACE = /\s/
const PARAGRAPH_BREAK = /\n[^\S\n]*\n/g
const LINK = /\[([^\]\n]{1,500})\]\(https?:\/\/[^\s)]{1,2000}\)/y

export function highlightRichText(source: string, { images = false }: { images?: boolean } = {}) {
  const segments: RichTextSegment[] = []
  const nextCache = new Map<string, { from: number; at: number }>()
  const next = (token: string, from: number) => {
    const cached = nextCache.get(token)

    if (cached !== undefined && cached.from <= from && (cached.at === -1 || cached.at >= from)) {
      return cached.at
    }

    const at = source.indexOf(token, from)

    nextCache.set(token, { from, at })

    return at
  }
  const push = (start: number, end: number, marks: RichTextMark[], syntax: boolean) => {
    if (end > start) {
      segments.push({ start, end, marks, syntax })
    }
  }
  const findCloser = (index: number, to: number) => {
    for (const { token, mark } of DELIMITERS) {
      if (!source.startsWith(token, index)) {
        continue
      }

      const single = token.length === 1

      if (single && SPACE.test(source[index + 1] ?? " ")) {
        continue
      }

      if (token === "_" && WORD.test(source[index - 1] ?? "")) {
        continue
      }

      let close = next(token, index + token.length + 1)

      for (
        let attempt = 0;
        attempt < MAX_CLOSER_ATTEMPTS && close !== -1 && close < to;
        attempt++
      ) {
        const valid = single
          ? !SPACE.test(source[close - 1] ?? " ") &&
            source[close + 1] !== token &&
            (token !== "_" || !WORD.test(source[close + 1] ?? ""))
          : true

        if (valid) {
          break
        }

        close = next(token, close + 1)
      }

      if (close === -1 || close >= to) {
        continue
      }

      if (!single) {
        while (close + token.length < to && source[close + token.length] === token[0]) {
          close += 1
        }
      }

      return { close, length: token.length, mark }
    }

    return undefined
  }
  const scan = (from: number, to: number, marks: RichTextMark[]) => {
    let plain = from
    let index = from

    while (index < to) {
      const char = source[index] ?? ""

      if (char === "\\" && index + 1 < to && ESCAPABLE.test(source[index + 1] ?? "")) {
        push(plain, index, marks, false)
        push(index, index + 1, marks, true)
        plain = index + 1
        index += 2

        continue
      }

      if (char === "[" && marks.length < MAX_DEPTH && !marks.includes("link")) {
        LINK.lastIndex = index

        const link = LINK.exec(source)

        if (link !== null && index + link[0].length <= to) {
          const labelEnd = index + 1 + (link[1] ?? "").length

          push(plain, index, marks, false)
          push(index, index + 1, marks, true)
          scan(index + 1, labelEnd, [...marks, "link"])
          push(labelEnd, index + link[0].length, marks, true)
          index += link[0].length
          plain = index

          continue
        }
      }

      const match =
        marks.length < MAX_DEPTH && (char === "*" || char === "_" || char === "~" || char === "|")
          ? findCloser(index, to)
          : undefined

      if (match === undefined) {
        index += 1

        continue
      }

      push(plain, index, marks, false)
      push(index, index + match.length, marks, true)
      scan(index + match.length, match.close, [...marks, match.mark])
      push(match.close, match.close + match.length, marks, true)
      index = match.close + match.length
      plain = index
    }

    push(plain, to, marks, false)
  }
  const scanText = (from: number, to: number) => {
    let paragraphStart = from

    for (const { index } of source.slice(from, to).matchAll(PARAGRAPH_BREAK)) {
      scan(paragraphStart, from + index, [])
      paragraphStart = from + index
    }

    scan(paragraphStart, to, [])
  }
  let textStart = 0
  let lineStart = 0

  for (const line of images ? source.split("\n") : []) {
    const lineEnd = lineStart + line.length

    if (COMMENT_IMAGE_LINE.test(line)) {
      scanText(textStart, lineStart)
      push(lineStart, lineEnd, ["image"], false)
      textStart = lineEnd
    }

    lineStart = lineEnd + 1
  }

  scanText(textStart, source.length)

  return segments
}

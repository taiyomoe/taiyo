import type {
  InlineNode,
  MarkdownDocument,
  MarkdownExtension,
  ParseOptions,
} from "@tanstack/markdown"
import { COMMENT_IMAGE_LINE, parseCommentImageLine } from "@taiyomoe/schemas/comment-content"
import { parseMarkdown } from "@tanstack/markdown/parser"

const MAX_SOURCE_LENGTH = 20_000
const BLANK = /^[\s\u00AD\u115F\u1160\u200B-\u200D\u2060\u2800\u3164\uFEFF]*$/u
const DECORATION = /^[\s\-=_*~|:]+$/
const SPOOFABLE_LABEL =
  /^\s*(?:[a-z][a-z\d+.-]*:\/\/)?(?:[\p{L}\p{N}-]+\.)+[\p{L}\p{N}-]{2,}(?:[/?#]\S*)?\s*$/iu

export const SPOILER_TAG = "rt-spoiler"

export const IMAGE_TAG = "rt-image"

export const EMOJI_TAG = "rt-emoji"

const EMOJI = /\p{RGI_Emoji}/gv
const inlineText = (nodes: InlineNode[], spoilers: "keep" | "mask" = "keep"): string =>
  nodes
    .map((node) => {
      if (node.type === "text") {
        return node.value
      }

      if (spoilers === "mask" && node.type === "inlineComponent" && node.tagName === SPOILER_TAG) {
        return "▇▇▇▇"
      }

      return "children" in node ? inlineText(node.children, spoilers) : ""
    })
    .join("")
const toSafeHref = (url: string) => {
  if (!/^https?:\/\//i.test(url)) {
    return null
  }

  try {
    const parsed = new URL(url)

    return (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      parsed.hostname !== "" &&
      parsed.username === "" &&
      parsed.password === ""
      ? parsed.href
      : null
  } catch {
    return null
  }
}
const getHostname = (value: string) => {
  try {
    return new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`).hostname
      .toLowerCase()
      .replace(/^www\./, "")
  } catch {
    return null
  }
}
const flatten = (nodes: InlineNode[], inLink = false): InlineNode[] =>
  nodes.flatMap((node): InlineNode[] => {
    if (node.type === "text") {
      return [node]
    }

    if (node.type === "inlineCode") {
      return [{ type: "text", value: `\`${node.value}\`` }]
    }

    if (node.type === "break") {
      return [{ type: "text", value: "\n" }]
    }

    if (node.type === "link") {
      const children = flatten(node.children, true)
      const href = toSafeHref(node.href)
      const label = inlineText(children).trim()

      if (inLink || href === null) {
        return children
      }

      if (label === "") {
        return []
      }

      const spoofed = SPOOFABLE_LABEL.test(label) && getHostname(label) !== getHostname(href)

      return [
        { type: "link", href, children: spoofed ? [{ type: "text", value: href }] : children },
      ]
    }

    if (node.type === "strong" || node.type === "emphasis" || node.type === "strike") {
      const children = flatten(node.children, inLink)

      return children.length === 0 ? [] : [{ type: node.type, children }]
    }

    if (node.type === "inlineComponent") {
      const children = flatten(node.children, inLink)
      const underline = node.tagName === "u"
      const spoiler = node.tagName === SPOILER_TAG && !inLink

      if (!underline && !spoiler) {
        return children
      }

      return inlineText(children).trim() === ""
        ? children
        : [
            {
              type: "inlineComponent",
              name: underline ? "underline" : "spoiler",
              tagName: underline ? "u" : SPOILER_TAG,
              attributes: {},
              children,
            },
          ]
    }

    return []
  })
const createParagraphs = (images: boolean): MarkdownExtension => ({
  name: "paragraphs",
  parseBlock(context) {
    const { lines, index } = context
    let cursor = index

    if (BLANK.test(lines[cursor] ?? "")) {
      while (cursor < lines.length && BLANK.test(lines[cursor] ?? "")) {
        cursor += 1
      }

      context.consume(cursor - index)

      return { type: "paragraph", children: [] }
    }

    const image = images ? parseCommentImageLine(lines[cursor] ?? "") : null

    if (image !== null) {
      context.consume(1)

      return {
        type: "component",
        name: "image",
        tagName: IMAGE_TAG,
        attributes: {},
        properties: { "data-id": image.id, "data-spoiler": image.spoiler ? "true" : "false" },
        children: [],
      }
    }

    const kept: string[] = []
    const startsImage = (line: string) => images && COMMENT_IMAGE_LINE.test(line)

    while (
      cursor < lines.length &&
      !BLANK.test(lines[cursor] ?? "") &&
      !(cursor > index && startsImage(lines[cursor] ?? ""))
    ) {
      const line = lines[cursor] ?? ""

      cursor += 1

      if (!DECORATION.test(line)) {
        kept.push(
          line
            .replace(/^\s*#{1,6}\s+/, "")
            .replace(/^\s*\|(?!\|)(.*[^|])\|\s*$/, "$1")
            .trim(),
        )
      }
    }

    context.consume(cursor - index)

    return {
      type: "paragraph",
      children: kept.length === 0 ? [] : context.parseInline(kept.join("\n")),
    }
  },
})
const underline: MarkdownExtension = {
  name: "underline",
  inlineParser: {
    markers: "_",
    parse({ source, index, parseInline }) {
      if (source[index + 1] !== "_") {
        return undefined
      }

      let close = source.indexOf("__", index + 2)

      if (close <= index + 2) {
        return undefined
      }

      while (source[close + 2] === "_") {
        close += 1
      }

      return {
        node: {
          type: "inlineComponent",
          name: "underline",
          tagName: "u",
          attributes: {},
          children: parseInline(source.slice(index + 2, close)),
        },
        length: close + 2 - index,
      }
    },
  },
}
const spoiler: MarkdownExtension = {
  name: "spoiler",
  inlineParser: {
    markers: "|",
    parse({ source, index, parseInline }) {
      if (source[index + 1] !== "|") {
        return undefined
      }

      const close = source.indexOf("||", index + 2)

      if (close <= index + 2) {
        return undefined
      }

      return {
        node: {
          type: "inlineComponent",
          name: "spoiler",
          tagName: SPOILER_TAG,
          attributes: {},
          children: parseInline(source.slice(index + 2, close)),
        },
        length: close + 2 - index,
      }
    },
  },
}
const singleTilde: MarkdownExtension = {
  name: "single-tilde",
  inlineParser: {
    markers: "~",
    parse({ source, index }) {
      return source[index + 1] === "~" || source[index - 1] === "~"
        ? undefined
        : { node: { type: "text", value: "~" }, length: 1 }
    },
  },
}
const allowlist: MarkdownExtension = {
  name: "allowlist",
  transformInline: (nodes) => flatten(nodes),
  transformDocument: (document) => ({
    type: "root",
    children: document.children.filter(
      (node) =>
        (node.type === "component" && node.tagName === IMAGE_TAG) ||
        (node.type === "paragraph" &&
          node.children.some((child) => child.type !== "text" || !BLANK.test(child.value))),
    ),
  }),
}
const toEmoji = (nodes: InlineNode[]): InlineNode[] =>
  nodes.flatMap((node): InlineNode[] => {
    if (node.type !== "text") {
      return "children" in node ? [{ ...node, children: toEmoji(node.children) }] : [node]
    }

    const parts: InlineNode[] = []
    let last = 0

    for (const match of node.value.matchAll(EMOJI)) {
      if (match.index > last) {
        parts.push({ type: "text", value: node.value.slice(last, match.index) })
      }

      parts.push({
        type: "inlineComponent",
        name: "emoji",
        tagName: EMOJI_TAG,
        attributes: {},
        properties: { "data-emoji": match[0] },
        children: [{ type: "text", value: match[0] }],
      })
      last = match.index + match[0].length
    }

    if (last < node.value.length) {
      parts.push({ type: "text", value: node.value.slice(last) })
    }

    return parts
  })
const emoji: MarkdownExtension = { name: "emoji", transformInline: toEmoji }
const createOptions = (comment: boolean) =>
  ({
    allowHtml: false,
    frontmatter: false,
    headingIds: false,
    urlTransform: (_url, kind, defaultUrl) => (kind === "link" ? toSafeHref(defaultUrl) : null),
    extensions: [
      createParagraphs(comment),
      underline,
      spoiler,
      singleTilde,
      allowlist,
      ...(comment ? [emoji] : []),
    ],
  }) satisfies ParseOptions
const OPTIONS = createOptions(false)
const COMMENT_OPTIONS = createOptions(true)
const sanitize = (source: string, keepImageLines: boolean) =>
  source
    .slice(0, MAX_SOURCE_LENGTH)
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, "")
    .replace(/(\p{M}{3})\p{M}+/gu, "$1")
    .split("\n")
    .map((line) =>
      keepImageLines && COMMENT_IMAGE_LINE.test(line)
        ? line
        : line
            .replace(/!\[[^\]\n]{0,500}\]\([^)\n]{0,2000}\)/g, "")
            .replace(/\[\]\([^)\n]{0,2000}\)/g, ""),
    )
    .join("\n")
    .replace(/^([^\S\n]{0,3})\[(?=[^\]\n]{1,1000}\]:)/gm, "$1\\[")

export const parseRichText = (source: string) => parseMarkdown(sanitize(source, false), OPTIONS)

export const parseCommentText = (source: string) =>
  parseMarkdown(sanitize(source, true), COMMENT_OPTIONS)

export const getRichTextParagraphs = (document: MarkdownDocument) =>
  document.children.flatMap((node) =>
    node.type === "paragraph" ? [inlineText(node.children, "mask").trim()] : [],
  )

/** The text of `source` on a single line, spoilers masked, or null when it has none. */
export const getRichTextSummary = (source: string | null | undefined) => {
  const text =
    source === null || source === undefined
      ? ""
      : getRichTextParagraphs(parseRichText(source)).join(" ").replaceAll(/\s+/g, " ").trim()

  return text === "" ? null : text
}

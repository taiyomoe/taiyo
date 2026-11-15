import type { ReactNode } from "react"
import { type ImageSource, Renderer } from "@takumi-rs/core"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { renderToStaticMarkup } from "react-dom/server"
import { loadOgFonts } from "@/features/og/lib/og-fonts"
import { OG_HEIGHT, OG_WIDTH } from "@/features/og/lib/og-theme"

const TWEMOJI_DIR = path.dirname(fileURLToPath(import.meta.resolve("@twemoji/svg/package.json")))
let renderer: Promise<Renderer> | undefined
/** One renderer per process: registering the fonts takes most of a second. */
const getRenderer = () => {
  renderer ??= (async () => {
    const instance = new Renderer()

    await Promise.all((await loadOgFonts()).map(async (font) => instance.registerFont(font)))

    return instance
  })()

  return renderer
}

/**
 * The largest font size, between `max` and `min`, at which `text` fits in
 * `lines` lines of `width` pixels, and how many lines it takes there. Titles
 * keep their full size when short and only shrink as much as they must; past
 * `min` the card clamps them instead.
 */
export const fitText = async (
  text: string,
  {
    width,
    lines,
    max,
    min,
    lineHeight,
    fontFamily,
    fontWeight = 700,
  }: {
    width: number
    lines: number
    max: number
    min: number
    lineHeight: number
    fontFamily: string
    fontWeight?: number
  },
) => {
  const instance = await getRenderer()
  const measure = async (fontSize: number) => {
    const { height } = await instance.measure(
      {
        type: "text",
        text,
        style: { width, fontSize, lineHeight, fontFamily, fontWeight, overflowWrap: "anywhere" },
      },
      { width },
    )

    return Math.round(height / (fontSize * lineHeight))
  }
  let low = min
  let high = max

  if ((await measure(max)) <= lines) {
    low = max
  }

  while (high - low > 1) {
    const middle = Math.floor((low + high) / 2)

    if ((await measure(middle)) <= lines) {
      low = middle
    } else {
      high = middle
    }
  }

  return { size: low, lines: Math.min(await measure(low), lines) }
}

/**
 * Whether the renderer can decode `image`: a file served as an image can still
 * be a format it does not read, and one bad picture must not fail the card.
 * The decoded image stays cached under its `src` for the card's own render.
 */
export const canDecode = async (image: ImageSource) => {
  const instance = await getRenderer()

  return instance
    .render(
      { type: "image", src: image.src, width: 1, height: 1 },
      { width: 1, height: 1, format: "raw", images: [image] },
    )
    .then(() => true)
    .catch(() => false)
}

/** How many children of a wrapping row land on its first line. */
export const countFirstRow = async (element: ReactNode) => {
  const instance = await getRenderer()
  const { children } = await instance.measure(renderToStaticMarkup(element))
  const top = children[0]?.transform[5]

  return children.filter((child) => child.transform[5] === top).length
}

const EMOJI = /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20E3/u
const graphemes = new Intl.Segmenter("en", { granularity: "grapheme" })
/** Twemoji names a file after its code points, dropping VS16 outside ZWJ sequences. */
const twemojiFile = (emoji: string) =>
  `${Array.from(emoji.includes("\u200D") ? emoji : emoji.replaceAll("\uFE0F", ""), (char) =>
    char.codePointAt(0)?.toString(16),
  ).join("-")}.svg`
const readEmoji = async (file: string) =>
  readFile(path.join(TWEMOJI_DIR, file))
    .then((data): ImageSource => ({ src: `twemoji:${file}`, data }))
    .catch(() => null)
/**
 * Swaps each emoji in the markup's text for its Twemoji picture, the set the
 * site draws emoji with, read from disk rather than a CDN. An emoji Twemoji
 * does not have stays text.
 */
const withTwemoji = async (markup: string) => {
  const files = new Set<string>()

  for (const [, text = ""] of markup.matchAll(/>([^<]+)</g)) {
    for (const { segment } of graphemes.segment(text)) {
      if (EMOJI.test(segment) && !segment.includes("\uFE0E")) {
        files.add(twemojiFile(segment))
      }
    }
  }

  const emoji = (await Promise.all([...files].map(readEmoji))).filter((image) => image !== null)
  const known = new Set(emoji.map((image) => image.src))
  const html = markup.replaceAll(/>([^<]+)</g, (_, text: string) => {
    const replaced = [...graphemes.segment(text)]
      .map(({ segment }) => {
        const src = `twemoji:${twemojiFile(segment)}`

        return EMOJI.test(segment) && known.has(src)
          ? `<img src="${src}" alt="" style="display:inline-block;width:1em;height:1em;margin:0 0.05em 0 0.1em;vertical-align:-0.1em">`
          : segment
      })
      .join("")

    return `>${replaced}<`
  })

  return { html, emoji }
}

type MeasuredNode = Awaited<ReturnType<Renderer["measure"]>>

const flattenRuns = ({ transform, runs, children }: MeasuredNode, block = "0"): TextBox[] => [
  ...runs.map(({ text, x, y, width, height }) => ({
    text,
    block,
    left: transform[4] + x,
    top: transform[5] + y,
    right: transform[4] + x + width,
    bottom: transform[5] + y + height,
  })),
  ...children.flatMap((child, index) => flattenRuns(child, `${block}.${index}`)),
]

/** A line of text, and the block it belongs to: lines of one block may touch. */
export type TextBox = {
  text: string
  block: string
  left: number
  top: number
  right: number
  bottom: number
}

/** Where every line of text of a card lands, in card pixels. */
export const measureOgText = async (element: ReactNode, images: ImageSource[] = []) => {
  const instance = await getRenderer()
  const { html, emoji } = await withTwemoji(renderToStaticMarkup(element))

  return flattenRuns(
    await instance.measure(html, {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      images: [...images, ...emoji],
    }),
  )
}

/**
 * Draws a card as a JPEG: crawlers cap image sizes (WhatsApp around 600 kB) and
 * a photographic backdrop compresses far better than as PNG.
 */
export const renderOgImage = async (element: ReactNode, images: ImageSource[] = []) => {
  const instance = await getRenderer()
  const { html, emoji } = await withTwemoji(renderToStaticMarkup(element))

  return instance.render(html, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    format: "jpeg",
    quality: 90,
    images: [...images, ...emoji],
  })
}

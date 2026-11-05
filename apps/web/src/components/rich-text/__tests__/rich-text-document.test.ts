import { renderHtml } from "@tanstack/markdown/html"
import { range } from "remeda"
import { describe, expect, it } from "vitest"
import { getRichTextParagraphs, parseRichText, SPOILER_TAG } from "../rich-text-document"

const ALLOWED_TAGS = new Set(["p", "strong", "em", "del", "u", "a", SPOILER_TAG])
const char = (codePoint: number) => String.fromCodePoint(codePoint)
const render = (source: string) => renderHtml(parseRichText(source))
const getTags = (html: string) => [...html.matchAll(/<\/?([a-z0-9-]+)([^>]*)>/gi)]
const expectSafe = (html: string) => {
  for (const [, tag, attributes] of getTags(html)) {
    expect(ALLOWED_TAGS.has(tag?.toLowerCase() ?? "")).toBe(true)

    if (tag?.toLowerCase() === "a" && attributes?.trim() !== "") {
      expect(attributes).toMatch(/^ href="https?:\/\/[^"\s]+"$/)
    } else {
      expect(attributes?.trim()).toBe("")
    }
  }
}

describe("parseRichText formatting", () => {
  it("renders the four supported formats", () => {
    expect(render("**bold** *italic* _italic_ __underline__ ~~strike~~")).toBe(
      "<p><strong>bold</strong> <em>italic</em> <em>italic</em> <u>underline</u> <del>strike</del></p>",
    )
  })

  it("treats double underscores as underline, not bold", () => {
    expect(render("__a__")).toBe("<p><u>a</u></p>")
    expect(render("___a___")).toBe("<p><u><em>a</em></u></p>")
    expect(render("__**a**__")).toBe("<p><u><strong>a</strong></u></p>")
  })

  it("keeps single tildes, escapes and intraword underscores literal", () => {
    expect(render("~a~")).toBe("<p>~a~</p>")
    expect(render("\\*a\\*")).toBe("<p>*a*</p>")
    expect(render("snake_case_name")).toBe("<p>snake_case_name</p>")
  })

  it("keeps line breaks inside a paragraph and splits on blank lines", () => {
    expect(render("one\ntwo\n\n\n\nthree")).toBe("<p>one\ntwo</p>\n<p>three</p>")
    expect(render("hard  \nbreak")).toBe("<p>hard\nbreak</p>")
  })
})

describe("parseRichText rejects everything else", () => {
  it("never emits HTML from the source", () => {
    const html = render('<script>alert(1)</script><img src=x onerror="alert(1)"><b>b</b>')

    expect(html).not.toMatch(/<script|<img|<b>/)
    expect(html).toContain("&lt;script&gt;")
  })

  it("keeps only absolute http and https link destinations", () => {
    expect(render("[label](javascript:alert(1))")).toBe("<p>label</p>")
    expect(render("[label](JaVaScRiPt:alert(1))")).toBe("<p>label</p>")
    expect(render("[label](data:text/html,x)")).toBe("<p>label</p>")
    expect(render("[label](/rules)")).toBe("<p>label</p>")
    expect(render("[label](//evil.example)")).toBe("<p>label</p>")
    expect(render("[label](mailto:a@b.c)")).toBe("<p>label</p>")
    expect(render("[label](https://user:pass@evil.example)")).toBe("<p>label</p>")
    expect(render("<https://evil.example>")).toBe("<p>&lt;https://evil.example&gt;</p>")
  })

  it("renders masked links with a normalized href", () => {
    expect(render("[**Taiyō**](https://taiyo.moe/a b)")).toBe(
      "<p>[<strong>Taiyō</strong>](https://taiyo.moe/a b)</p>",
    )
    expect(render("[**Taiyō**](https://taiyo.moe/x)")).toBe(
      '<p><a href="https://taiyo.moe/x"><strong>Taiyō</strong></a></p>',
    )
    expect(render('[t](https://taiyo.moe "title")')).toBe(
      '<p><a href="https://taiyo.moe/">t</a></p>',
    )
    expect(render("[t](https://ТАIYO.moe)")).toBe(
      '<p><a href="https://xn--iyo-5cd3g.moe/">t</a></p>',
    )
  })

  it("shows the real destination when the label pretends to be another URL", () => {
    expect(render("[https://google.com](https://evil.example/login)")).toBe(
      '<p><a href="https://evil.example/login">https://evil.example/login</a></p>',
    )
    expect(render("[google.com](https://evil.example)")).toBe(
      '<p><a href="https://evil.example/">https://evil.example/</a></p>',
    )
    expect(render("[mangadex.org](https://www.mangadex.org/title/1)")).toBe(
      '<p><a href="https://www.mangadex.org/title/1">mangadex.org</a></p>',
    )
    expect(render("[Read on our site](https://evil.example)")).toBe(
      '<p><a href="https://evil.example/">Read on our site</a></p>',
    )
  })

  it("drops images, including images wrapped in links", () => {
    expect(render("before ![alt](https://x/y.png) after")).toBe("<p>before  after</p>")
    expect(render("[![banner](https://x/y.png)](https://link)")).toBe("")
  })

  it("renders spoilers and keeps them out of links", () => {
    expect(render("a ||secret **bold**|| b")).toBe(
      `<p>a <${SPOILER_TAG}>secret <strong>bold</strong></${SPOILER_TAG}> b</p>`,
    )
    expect(render("|| ||")).toBe("")
    expect(render("[||x||](https://taiyo.moe)")).toBe('<p><a href="https://taiyo.moe/">x</a></p>')
    expect(render("||[x](https://taiyo.moe)||")).toBe(
      `<p><${SPOILER_TAG}><a href="https://taiyo.moe/">x</a></${SPOILER_TAG}></p>`,
    )
    expect(render("||spoiler line||")).toBe(`<p><${SPOILER_TAG}>spoiler line</${SPOILER_TAG}></p>`)
    expect(render("| table row |")).toBe("<p>table row</p>")
  })

  it("masks spoilers in plain-text previews", () => {
    expect(getRichTextParagraphs(parseRichText("The killer is ||the butler||."))).toEqual([
      "The killer is ▇▇▇▇.",
    ])
  })

  it("does not let reference or footnote definitions swallow lines", () => {
    expect(render("[ref]: https://evil\n\n[ref]")).toBe("<p>[ref]: https://evil</p>\n<p>[ref]</p>")
    expectSafe(render("x[^1]\n\n[^1]: note"))
    expect(render("x[^1]\n\n[^1]: note")).toContain("[^1]: note")
  })

  it("renders block syntax as paragraphs", () => {
    expect(render("# Title")).toBe("<p>Title</p>")
    expect(render("- a\n- b")).toBe("<p>- a\n- b</p>")
    expect(render("> quote")).toBe("<p>&gt; quote</p>")
    expect(render("    code")).toBe("<p>code</p>")
    expect(render("```\ncode\n```")).toBe("<p>`code`</p>")
    expect(render("| a | b |\n| - | - |\n| 1 | 2 |")).toBe("<p>a | b\n1 | 2</p>")
    expect(render("---\ntitle: x\n---\nbody")).toBe("<p>title: x\nbody</p>")
  })

  it("ignores lines that only hold invisible characters", () => {
    const filler = [0x200b, 0x2060, 0x3164, 0x2800, 0xfeff].map(char)

    expect(render(["a", ...filler, "b"].join("\n"))).toBe("<p>a</p>\n<p>b</p>")
    expect(render(filler.join("\n\n"))).toBe("")
  })

  it("strips bidi overrides and caps stacked combining marks", () => {
    expect(render(`abc${char(0x202e)}def${char(0x2066)}`)).toBe("<p>abcdef</p>")
    expect(render(`a${char(0x301).repeat(200)}`)).toBe(`<p>a${char(0x301).repeat(3)}</p>`)
  })
})

describe("parseRichText under stress", () => {
  const inputs = {
    stars: "*".repeat(20_000),
    underscores: "_".repeat(20_000),
    tildes: "~".repeat(20_000),
    brackets: "[".repeat(20_000),
    openBold: "**a ".repeat(5000),
    openUnderline: "__a ".repeat(5000),
    nested: `${"*".repeat(10_000)}a${"*".repeat(10_000)}`,
    alternating: `${"**__".repeat(5000)}x${"__**".repeat(5000)}`,
    links: "[a](b".repeat(4000),
    realLinks: "[a](https://taiyo.moe/x) ".repeat(800),
    spoilers: "||".repeat(10_000),
    openSpoilers: "||a ".repeat(5000),
    images: "![".repeat(10_000),
    backticks: "`a".repeat(10_000),
    lines: "a\n".repeat(10_000),
    references: "[a]: b\n".repeat(3000),
    zalgo: `a${char(0x301).repeat(20_000)}`,
  }

  for (const [name, source] of Object.entries(inputs)) {
    it(`stays fast and safe on ${name}`, () => {
      const started = performance.now()
      const html = render(source)

      expect(performance.now() - started).toBeLessThan(500)
      expectSafe(html)
    })
  }

  it("emits only allowed tags for random markdown-heavy input", () => {
    const alphabet = [
      "*",
      "_",
      "~",
      "`",
      "[",
      "]",
      "(",
      ")",
      "!",
      "<",
      ">",
      "#",
      "|",
      "\\",
      "\n",
      " ",
      "a",
      "-",
      ":",
      "&",
    ]
    let seed = 42
    const random = () => {
      seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648

      return seed / 2_147_483_648
    }
    const seen = new Set<string>()

    for (const _ of range(0, 500)) {
      const html = render(
        range(0, 200)
          .map(() => alphabet[Math.floor(random() * alphabet.length)])
          .join(""),
      )

      for (const [tag, attributes] of getTags(html).map((match) => [match[1], match[2]])) {
        seen.add(`${tag?.toLowerCase()}${attributes?.trim() === "" ? "" : " with attributes"}`)
      }
    }

    expect([...seen].sort()).toEqual(["del", "em", "p", SPOILER_TAG, "strong", "u"].sort())
  })

  it("truncates sources past the hard limit", () => {
    expect(getRichTextParagraphs(parseRichText("a".repeat(50_000)))[0]).toHaveLength(20_000)
  })
})

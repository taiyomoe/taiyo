import type { MarkdownDocument } from "@tanstack/markdown"
import type { ComponentProps, KeyboardEvent, ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Markdown, type MarkdownComponents } from "@tanstack/markdown/react"
import { useState } from "react"
import { getRichTextParagraphs, SPOILER_TAG } from "@/components/rich-text/rich-text-document"
import { m } from "@/paraglide/messages"

const PREVIEW_LENGTH = 700
const PREVIEW_LINES = 8
const styles = stylex.create({
  root: {
    gap: "0.5rem",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  content: {
    gap: "0.875rem",
    color: `color-mix(in srgb, ${colors.foreground} 85%, transparent)`,
    display: "flex",
    flexDirection: "column",
    fontSize: "1rem",
    isolation: "isolate",
    lineHeight: 1.7,
    maxWidth: "48rem",
    minWidth: 0,
    width: "100%",
  },
  contentSm: {
    gap: "0.625rem",
    fontSize: "0.9375rem",
    lineHeight: 1.6,
  },
  collapsed: {
    overflow: "hidden",
    maskImage: "linear-gradient(to bottom, black 55%, transparent)",
    maxHeight: "13.6em",
  },
  paragraph: {
    margin: 0,
    overflowWrap: "anywhere",
    unicodeBidi: "plaintext",
    whiteSpace: "pre-line",
  },
  link: {
    color: { default: colors.foreground, ":hover": colors.mutedForeground },
    textDecorationColor: `color-mix(in srgb, ${colors.foreground} 40%, transparent)`,
    textDecorationLine: "underline",
    textDecorationThickness: "1px",
    textUnderlineOffset: "0.2em",
    transitionDuration: "150ms",
    transitionProperty: "color",
  },
  spoiler: {
    borderRadius: radius.sm,
    paddingInline: "0.125rem",
    backgroundColor: {
      default: `color-mix(in srgb, ${colors.foreground} 24%, ${colors.background})`,
      ":hover": `color-mix(in srgb, ${colors.foreground} 30%, ${colors.background})`,
    },
    boxDecorationBreak: "clone",
    cursor: "pointer",
    outlineColor: colors.ring,
    outlineOffset: "1px",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
  },
  spoilerHidden: {
    visibility: "hidden",
  },
  spoilerRevealed: {
    borderRadius: radius.sm,
    paddingInline: "0.125rem",
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 8%, transparent)`,
    boxDecorationBreak: "clone",
  },
})

function Paragraph(props: ComponentProps<"p">) {
  return <p {...props} sx={styles.paragraph} />
}

function Strikethrough({ children }: ComponentProps<"del">) {
  return <s>{children}</s>
}

function Link({ href, children }: ComponentProps<"a">) {
  if (href === undefined || !/^https?:\/\//i.test(href)) {
    return <span>{children}</span>
  }

  return (
    <a
      href={href}
      rel="nofollow ugc noopener noreferrer"
      sx={styles.link}
      target="_blank"
      title={href}
    >
      {children}
    </a>
  )
}

function Spoiler({ children }: { children?: ReactNode }) {
  const [revealed, setRevealed] = useState(false)

  if (revealed) {
    return <span sx={styles.spoilerRevealed}>{children}</span>
  }

  return (
    <span
      aria-label={m.rich_text_spoiler_hidden()}
      onClick={() => {
        setRevealed(true)
      }}
      onKeyDown={(event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          setRevealed(true)
        }
      }}
      role="button"
      sx={styles.spoiler}
      tabIndex={0}
    >
      <span aria-hidden sx={styles.spoilerHidden}>
        {children}
      </span>
    </span>
  )
}

const components = {
  p: Paragraph,
  del: Strikethrough,
  a: Link,
  [SPOILER_TAG]: Spoiler,
} satisfies MarkdownComponents

export function RichText({
  document,
  collapsible = false,
  size = "default",
}: {
  document: MarkdownDocument
  collapsible?: boolean
  size?: "default" | "sm"
}) {
  const [expanded, setExpanded] = useState(false)
  const paragraphs = getRichTextParagraphs(document)
  const text = paragraphs.join("\n")
  const long =
    collapsible &&
    (text.length > PREVIEW_LENGTH ||
      text.split("\n").length + (paragraphs.length - 1) / 2 > PREVIEW_LINES)

  return (
    <div sx={styles.root}>
      <div
        sx={[
          styles.content,
          size === "sm" && styles.contentSm,
          long && !expanded && styles.collapsed,
        ]}
      >
        <Markdown components={components}>{document}</Markdown>
      </div>
      {long ? (
        <Button
          onClick={() => {
            setExpanded(!expanded)
          }}
          size="sm"
          variant="ghost"
        >
          {expanded ? m.show_less() : m.show_more()}
        </Button>
      ) : null}
    </div>
  )
}

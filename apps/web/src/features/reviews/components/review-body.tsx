import * as stylex from "@stylexjs/stylex"
import { EyeOff } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useId, useLayoutEffect, useRef, useState } from "react"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  text: {
    margin: 0,
    color: colors.foreground,
    fontSize: "0.9375rem",
    lineHeight: 1.6,
    overflowWrap: "anywhere",
    whiteSpace: "pre-line",
  },
  clamped: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 8,
    display: "-webkit-box",
  },
  toggle: {
    alignSelf: "flex-start",
    marginInlineStart: "-0.5rem",
  },
  spoiler: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: "0.75rem",
    paddingBlock: "0.75rem",
    paddingInline: "0.875rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
    justifyContent: "space-between",
  },
  spoilerLabel: {
    gap: "0.5rem",
    alignItems: "center",
    display: "inline-flex",
  },
  root: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
})

/** The text of a review: behind a warning when it reveals the story, folded when long. */
export function ReviewBody({
  body,
  containsSpoilers,
}: {
  body: string
  containsSpoilers: boolean
}) {
  const id = useId()
  const text = useRef<HTMLParagraphElement | null>(null)
  const [revealed, setRevealed] = useState(!containsSpoilers)
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)

  useLayoutEffect(() => {
    const element = text.current

    if (element === null || expanded) {
      return undefined
    }

    const measure = () => {
      setOverflowing(element.scrollHeight > element.clientHeight + 1)
    }
    const observer = new ResizeObserver(measure)

    measure()
    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [body, expanded, revealed])

  if (!revealed) {
    return (
      <div sx={styles.spoiler}>
        <span sx={styles.spoilerLabel}>
          <EyeOff aria-hidden size={16} />
          {m.reviews_spoiler_warning()}
        </span>
        <Button
          onClick={() => {
            setRevealed(true)
          }}
          size="sm"
          variant="outline"
        >
          {m.reviews_spoiler_reveal()}
        </Button>
      </div>
    )
  }

  return (
    <div sx={styles.root}>
      <p ref={text} dir="auto" id={id} sx={[styles.text, !expanded && styles.clamped]}>
        {body}
      </p>
      {overflowing || expanded ? (
        <Button
          aria-controls={id}
          aria-expanded={expanded}
          onClick={() => {
            setExpanded(!expanded)
          }}
          size="sm"
          sx={styles.toggle}
          variant="ghost"
        >
          {expanded ? m.reviews_show_less() : m.reviews_show_more()}
        </Button>
      ) : null}
    </div>
  )
}

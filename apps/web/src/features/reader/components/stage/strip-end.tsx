import * as stylex from "@stylexjs/stylex"
import { ArrowLeft, ChevronRight } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { type RefObject, useEffect, useEffectEvent, useRef } from "react"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  end: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    paddingBottom: "6rem",
    paddingTop: "4rem",
  },
  title: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 600,
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
  },
})

export function StripEnd({
  root,
  chapterLabel,
  nextLabel,
  onVisible,
  onNext,
  onBack,
}: {
  root: RefObject<HTMLElement | null>
  chapterLabel: string
  nextLabel: string | null
  onVisible: () => void
  onNext: () => void
  onBack: () => void
}) {
  const element = useRef<HTMLDivElement | null>(null)
  const visible = useEffectEvent(onVisible)

  useEffect(() => {
    const node = element.current

    if (node === null) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          visible()
        }
      },
      { root: root.current },
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [root])

  return (
    <div
      onClick={(event) => {
        event.stopPropagation()
      }}
      ref={element}
      sx={styles.end}
    >
      <p sx={styles.title}>{m.reader_end_title({ chapter: chapterLabel })}</p>
      <div sx={styles.actions}>
        <Button onClick={onBack} variant="secondary">
          <ArrowLeft />
          {m.reader_back_to_title()}
        </Button>
        {nextLabel === null ? null : (
          <Button onClick={onNext}>
            {m.reader_end_next({ chapter: nextLabel })}
            <ChevronRight />
          </Button>
        )}
      </div>
    </div>
  )
}

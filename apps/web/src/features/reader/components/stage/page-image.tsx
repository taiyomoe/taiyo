import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"
import { useState } from "react"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  image: {
    display: "block",
    userSelect: "none",
  },
  hidden: {
    visibility: "hidden",
  },
  status: {
    inset: 0,
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    fontSize: "0.875rem",
    justifyContent: "center",
    pointerEvents: "none",
    position: "absolute",
  },
  retry: {
    pointerEvents: "auto",
  },
})

export function PageImage({
  url,
  index,
  priority = "high",
  sx,
  onLoad,
}: {
  url: string
  index: number
  priority?: "high" | "low" | "auto"
  sx?: Sx
  onLoad: (index: number, aspect: number) => void
}) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading")
  const src = attempt === 0 ? url : `${url}${url.includes("?") ? "&" : "?"}retry=${attempt}`

  return (
    <>
      <img
        alt={m.reader_page_alt({ page: index + 1 })}
        decoding="async"
        draggable={false}
        fetchPriority={priority}
        key={src}
        onError={() => {
          setState("failed")
        }}
        onLoad={(event) => {
          setState("loaded")
          onLoad(index, event.currentTarget.naturalWidth / event.currentTarget.naturalHeight)
        }}
        src={src}
        sx={[styles.image, state === "failed" && styles.hidden, sx]}
      />
      {state === "loaded" ? null : (
        <span sx={styles.status}>
          {state === "loading" ? (
            <Spinner size={24} />
          ) : (
            <>
              {m.reader_page_failed({ page: index + 1 })}
              <Button
                onClick={(event) => {
                  event.stopPropagation()
                  setState("loading")
                  setAttempt((value) => value + 1)
                }}
                size="sm"
                sx={styles.retry}
                variant="secondary"
              >
                {m.reader_page_retry()}
              </Button>
            </>
          )}
        </span>
      )}
    </>
  )
}

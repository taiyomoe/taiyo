import * as stylex from "@stylexjs/stylex"
import { AlertTriangle } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useRef, useState } from "react"
import type { ReaderStep } from "@/features/reader/lib/reader-input"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  body: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  gap: {
    margin: 0,
    gap: "0.5rem",
    alignItems: "flex-start",
    color: colors.warningForeground,
    display: "flex",
    fontSize: "0.875rem",
    lineHeight: 1.5,
  },
  gapIcon: {
    flexShrink: 0,
    marginTop: "0.125rem",
  },
  checkbox: {
    gap: "0.625rem",
    alignItems: "center",
    cursor: "pointer",
    display: "flex",
    fontSize: "0.875rem",
    userSelect: "none",
  },
})

export type ChapterBoundary = {
  step: ReaderStep
  currentLabel: string
  target: { label: string; isExternal: boolean } | null
  gap: { from: string; to: string } | null
}

export function ChapterBoundaryDialog({
  open,
  boundary,
  mediaTitle,
  onConfirm,
  onClose,
}: {
  open: boolean
  boundary: ChapterBoundary | null
  mediaTitle: string
  onConfirm: (dontAskAgain: boolean) => void
  onClose: () => void
}) {
  const [dontAsk, setDontAsk] = useState(false)
  const confirm = useRef<HTMLButtonElement | null>(null)

  if (boundary === null) {
    return null
  }

  const { step, currentLabel, target, gap } = boundary
  const next = step === "next"
  let description: string = next
    ? m.reader_boundary_latest({ media: mediaTitle })
    : m.reader_boundary_first({ media: mediaTitle })
  let confirmLabel: string = m.reader_boundary_go_title()

  if (target !== null) {
    description = next
      ? m.reader_boundary_next({ chapter: target.label })
      : m.reader_boundary_prev({ chapter: target.label })
    confirmLabel = next ? m.reader_boundary_go_next() : m.reader_boundary_go_prev()

    if (target.isExternal) {
      description = `${description} ${m.reader_boundary_external()}`
    }
  }

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) {
          setDontAsk(false)
        }
      }}
      open={open}
    >
      <DialogPopup initialFocus={confirm}>
        <DialogHeader>
          <DialogTitle>
            {next
              ? m.reader_boundary_end_title({ chapter: currentLabel })
              : m.reader_boundary_start_title({ chapter: currentLabel })}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogPanel sx={styles.body}>
          {gap === null ? null : (
            <p sx={styles.gap}>
              <AlertTriangle size={16} {...stylex.props(styles.gapIcon)} />
              {m.reader_boundary_gap(gap)}
            </p>
          )}
          <label sx={styles.checkbox}>
            <Checkbox checked={dontAsk} onCheckedChange={setDontAsk} />
            {m.reader_boundary_dont_ask()}
          </label>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            {m.reader_boundary_stay()}
          </DialogClose>
          <Button
            onClick={() => {
              onConfirm(dontAsk)
            }}
            ref={confirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}

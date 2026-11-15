import * as stylex from "@stylexjs/stylex"
import { ImageAdd } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import { m } from "@/paraglide/messages"

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif"
const styles = stylex.create({
  drop: {
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: "0.75rem",
    paddingBlock: "2.25rem",
    paddingInline: "1.5rem",
    alignItems: "center",
    backgroundColor: colors.card,
    color: colors.mutedForeground,
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    transitionDuration: motion.enter,
    transitionProperty: "border-color, background-color",
  },
  dropActive: {
    borderColor: colors.primary,
    backgroundColor: `color-mix(in srgb, ${colors.primary} 6%, ${colors.card})`,
  },
  icon: {
    color: colors.mutedForeground,
    height: "2rem",
    width: "2rem",
  },
  title: {
    color: colors.foreground,
    fontSize: "1.0625rem",
    fontWeight: 600,
  },
  hint: {
    fontSize: "0.875rem",
    lineHeight: 1.5,
    maxWidth: "34rem",
  },
  input: {
    display: "none",
  },
  note: {
    margin: 0,
    color: colors.warning,
    fontSize: "0.875rem",
    overflowWrap: "anywhere",
  },
})

export function ImageDropZone({
  title,
  hint,
  rejected,
  onFiles,
}: {
  title: string
  hint: string
  rejected: readonly string[]
  onFiles: (files: File[]) => void
}) {
  const [over, setOver] = useState(false)

  return (
    <>
      <div
        onDragLeave={() => {
          setOver(false)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setOver(true)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setOver(false)
          onFiles([...event.dataTransfer.files])
        }}
        sx={[styles.drop, over && styles.dropActive]}
      >
        <ImageAdd {...stylex.props(styles.icon)} />
        <span sx={styles.title}>{title}</span>
        <span sx={styles.hint}>{hint}</span>
        <Button render={<label />} variant="outline">
          {m.media_images_choose()}
          <input
            accept={ACCEPT}
            multiple
            onChange={(event) => {
              onFiles([...(event.target.files ?? [])])
              event.target.value = ""
            }}
            sx={styles.input}
            type="file"
          />
        </Button>
      </div>
      {rejected.length === 0 ? null : (
        <p sx={styles.note}>{m.media_images_rejected({ names: rejected.join(", ") })}</p>
      )}
    </>
  )
}

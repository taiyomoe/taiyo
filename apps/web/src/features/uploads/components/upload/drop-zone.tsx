import * as stylex from "@stylexjs/stylex"
import { CloudUpload, Plus } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import {
  type DroppedFile,
  filesFromInput,
  walk,
} from "@/features/uploads/lib/chapter-batch/sources"
import { m } from "@/paraglide/messages"

type DropZoneProps = {
  reading: boolean
  unsupported: string[]
  onFiles: (files: Promise<DroppedFile[]>) => void
  onAddLinkOnly: () => void
}

const styles = stylex.create({
  drop: {
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: "0.75rem",
    paddingBlock: "2.5rem",
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
  dropIcon: {
    color: colors.mutedForeground,
    height: "2rem",
    width: "2rem",
  },
  dropTitle: {
    color: colors.foreground,
    fontSize: "1.0625rem",
    fontWeight: 600,
  },
  dropHint: {
    fontSize: "0.875rem",
    lineHeight: 1.5,
    maxWidth: "34rem",
  },
  dropActions: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "0.25rem",
  },
  hiddenInput: {
    display: "none",
  },
  reading: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  note: {
    margin: 0,
    color: colors.warning,
    fontSize: "0.875rem",
    overflowWrap: "anywhere",
  },
})

export function DropZone({ reading, unsupported, onFiles, onAddLinkOnly }: DropZoneProps) {
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

          if (!reading) {
            const entries = [...event.dataTransfer.items].flatMap((item) => {
              const entry = item.webkitGetAsEntry()

              return entry === null ? [] : [entry]
            })

            onFiles(
              Promise.all(entries.map((entry) => walk(entry, ""))).then((files) => files.flat()),
            )
          }
        }}
        sx={[styles.drop, over && styles.dropActive]}
      >
        <CloudUpload {...stylex.props(styles.dropIcon)} />
        <span sx={styles.dropTitle}>{m.upload_drop_title()}</span>
        <span sx={styles.dropHint}>{m.upload_drop_hint()}</span>
        {reading ? (
          <span sx={styles.reading}>
            <Spinner />
            {m.upload_reading()}
          </span>
        ) : (
          <div sx={styles.dropActions}>
            <Button disabled={reading} render={<label />} variant="outline">
              {m.upload_choose_folder()}
              <input
                disabled={reading}
                multiple
                onChange={(event) => {
                  onFiles(Promise.resolve(filesFromInput(event.target.files)))
                  event.target.value = ""
                }}
                ref={(input) => {
                  input?.setAttribute("webkitdirectory", "")
                }}
                sx={styles.hiddenInput}
                type="file"
              />
            </Button>
            <Button disabled={reading} render={<label />} variant="outline">
              {m.upload_choose_files()}
              <input
                accept="image/jpeg,image/png,image/webp,image/gif,.zip,.cbz"
                disabled={reading}
                multiple
                onChange={(event) => {
                  onFiles(Promise.resolve(filesFromInput(event.target.files)))
                  event.target.value = ""
                }}
                sx={styles.hiddenInput}
                type="file"
              />
            </Button>
            <Button disabled={reading} onClick={onAddLinkOnly} variant="ghost">
              <Plus />
              {m.upload_add_link_only()}
            </Button>
          </div>
        )}
      </div>
      {unsupported.length === 0 ? null : (
        <p sx={styles.note}>{m.upload_unsupported({ names: unsupported.join(", ") })}</p>
      )}
    </>
  )
}

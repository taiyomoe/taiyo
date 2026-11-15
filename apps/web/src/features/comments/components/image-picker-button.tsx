import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { ImageAdd, Upload } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useRef, useState } from "react"
import type { ImageCollection, LibraryImage } from "@/features/comments/api/comment-images"
import { ImagePickerGrid } from "@/features/comments/components/image-picker-grid"
import { m } from "@/paraglide/messages"

const ACCEPT = "image/jpeg,image/png,image/gif,image/webp,image/avif"
const styles = stylex.create({
  popup: {
    width: "min(22rem, calc(100vw - 2rem))",
  },
  body: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  upload: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
  },
  hint: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
  },
  input: {
    display: "none",
  },
})

export function ImagePickerButton({
  disabled,
  onPick,
  onFiles,
}: {
  disabled?: boolean | undefined
  onPick: (image: LibraryImage) => void
  onFiles: (files: File[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [collection, setCollection] = useState<ImageCollection>("favorites")
  const input = useRef<HTMLInputElement | null>(null)

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            aria-label={m.comments_picker()}
            disabled={disabled}
            onMouseDown={(event) => {
              event.preventDefault()
            }}
            size="icon-sm"
            title={m.comments_picker()}
            variant="ghost"
          />
        }
      >
        <ImageAdd />
      </PopoverTrigger>
      <PopoverPopup align="end" side="top" sx={styles.popup}>
        <div sx={styles.body}>
          <div sx={styles.upload}>
            <span sx={styles.hint}>
              {m.comments_picker_hint({
                size: config.comments.maxImageSizeBytes / 1024 / 1024,
              })}
            </span>
            <Button
              onClick={() => {
                input.current?.click()
              }}
              size="sm"
            >
              <Upload />
              {m.comments_picker_upload()}
            </Button>
            <input
              accept={ACCEPT}
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files ?? [])

                event.target.value = ""

                if (files.length > 0) {
                  setOpen(false)
                  onFiles(files)
                }
              }}
              ref={input}
              sx={styles.input}
              type="file"
            />
          </div>
          <Tabs
            onValueChange={(value: ImageCollection) => {
              setCollection(value)
            }}
            value={collection}
          >
            <TabsList variant="underline">
              <TabsTab value="favorites">{m.comments_picker_favorites()}</TabsTab>
              <TabsTab value="uploads">{m.comments_picker_uploads()}</TabsTab>
            </TabsList>
            <TabsPanel value={collection}>
              <ImagePickerGrid
                collection={collection}
                onPick={(image) => {
                  setOpen(false)
                  onPick(image)
                }}
              />
            </TabsPanel>
          </Tabs>
        </div>
      </PopoverPopup>
    </Popover>
  )
}

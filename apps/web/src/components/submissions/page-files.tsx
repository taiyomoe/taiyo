import type { ImageMimeType } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import { ChevronDown, ChevronUp, Close, Image } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useId, useState } from "react"
import { isUploadablePage } from "@/lib/queries/submissions"
import { m } from "@/paraglide/messages"

export type PageFile = { key: string; url: string; file: File & { type: ImageMimeType } }

const styles = stylex.create({
  drop: {
    padding: "1.75rem",
    borderColor: {
      default: colors.border,
      ":hover": `color-mix(in srgb, ${colors.foreground} 30%, transparent)`,
    },
    borderRadius: radius.xl,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    transitionDuration: motion.enter,
    transitionProperty: "border-color",
  },
  dropActive: {
    borderColor: colors.primary,
  },
  dropTitle: {
    color: colors.foreground,
    fontWeight: 500,
  },
  input: {
    display: "none",
  },
  icon: {
    height: "1.75rem",
    width: "1.75rem",
  },
  list: {
    margin: 0,
    padding: 0,
    gap: "0.375rem",
    listStyle: "none",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(8.5rem, 1fr))",
    marginTop: "1rem",
  },
  page: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
  },
  thumb: {
    aspectRatio: "3 / 4",
    backgroundColor: colors.muted,
    display: "block",
    objectFit: "cover",
    width: "100%",
  },
  meta: {
    padding: "0.375rem",
    gap: "0.125rem",
    alignItems: "center",
    display: "flex",
  },
  index: {
    color: colors.mutedForeground,
    flexGrow: 1,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
    paddingInlineStart: "0.25rem",
  },
  skipped: {
    margin: 0,
    color: colors.warning,
    fontSize: "0.875rem",
    marginTop: "0.75rem",
  },
})
const byName = (a: PageFile, b: PageFile) =>
  a.file.name.localeCompare(b.file.name, undefined, { numeric: true, sensitivity: "base" })

export function PageFiles({
  value,
  onChange,
  disabled,
}: {
  value: PageFile[]
  onChange: (value: PageFile[]) => void
  disabled: boolean
}) {
  const inputId = useId()
  const [dragging, setDragging] = useState(false)
  const [skipped, setSkipped] = useState(0)
  const add = (files: FileList | null) => {
    const list = [...(files ?? [])]
    const accepted = list.filter(isUploadablePage)

    setSkipped(list.length - accepted.length)
    onChange(
      [
        ...value,
        ...accepted.map((file) => ({
          key: crypto.randomUUID(),
          url: URL.createObjectURL(file),
          file,
        })),
      ].sort(byName),
    )
  }
  const move = (index: number, offset: number) => {
    const next = [...value]
    const [item] = next.splice(index, 1)

    if (item !== undefined) {
      next.splice(index + offset, 0, item)
      onChange(next)
    }
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        onDragLeave={() => {
          setDragging(false)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)

          if (!disabled) {
            add(event.dataTransfer.files)
          }
        }}
        sx={[styles.drop, dragging && styles.dropActive]}
      >
        <Image {...stylex.props(styles.icon)} />
        <span sx={styles.dropTitle}>{m.upload_pages_drop()}</span>
        <span>{m.upload_pages_hint()}</span>
        <input
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={disabled}
          id={inputId}
          multiple
          onChange={(event) => {
            add(event.target.files)
            event.target.value = ""
          }}
          sx={styles.input}
          type="file"
        />
      </label>
      {skipped === 0 ? null : (
        <p sx={styles.skipped}>{m.upload_pages_skipped({ count: skipped })}</p>
      )}
      {value.length === 0 ? null : (
        <ol sx={styles.list}>
          {value.map((page, index) => (
            <li key={page.key} sx={styles.page}>
              <img alt="" src={page.url} sx={styles.thumb} />
              <div sx={styles.meta}>
                <span sx={styles.index}>{index + 1}</span>
                <Button
                  aria-label={m.upload_page_earlier()}
                  disabled={disabled || index === 0}
                  onClick={() => {
                    move(index, -1)
                  }}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                >
                  <ChevronUp />
                </Button>
                <Button
                  aria-label={m.upload_page_later()}
                  disabled={disabled || index === value.length - 1}
                  onClick={() => {
                    move(index, 1)
                  }}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                >
                  <ChevronDown />
                </Button>
                <Button
                  aria-label={m.upload_page_remove()}
                  disabled={disabled}
                  onClick={() => {
                    URL.revokeObjectURL(page.url)
                    onChange(value.filter((item) => item.key !== page.key))
                  }}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                >
                  <Close />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

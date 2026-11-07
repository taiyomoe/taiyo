import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import {
  commentImageToken,
  getCommentImageIds,
  getCommentText,
  isBlankCommentText,
  parseCommentImageLine,
} from "@taiyomoe/schemas/comment-content"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useRef, useState } from "react"
import type { CommentImage } from "@/features/comments/api/comments"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { insertAtCursor, RichTextEditor } from "@/components/rich-text/rich-text-editor"
import { CommentContent } from "@/features/comments/components/comment-content"
import { EmojiPickerButton } from "@/features/comments/components/emoji-picker-button"
import { ImagePickerButton } from "@/features/comments/components/image-picker-button"
import { useCommentImageUploads } from "@/features/comments/hooks/use-comment-image-uploads"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  footer: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  status: {
    gap: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.75rem",
    marginInlineEnd: "auto",
  },
  counter: {
    fontFamily: font.mono,
    fontVariantNumeric: "tabular-nums",
  },
  over: {
    color: colors.destructiveForeground,
  },
  uploading: {
    gap: "0.375rem",
    alignItems: "center",
    display: "inline-flex",
  },
  preview: {
    padding: "0.875rem",
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  previewLabel: {
    color: colors.mutedForeground,
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
  },
})
const toCommentImage = (image: Omit<CommentImage, "favorited"> & { favorited?: boolean }) => ({
  id: image.id,
  url: image.url,
  width: image.width,
  height: image.height,
  animated: image.animated,
  favorited: image.favorited ?? false,
})
const mapLines = (content: string, id: string, map: (spoiler: boolean) => string | null) =>
  content
    .split("\n")
    .flatMap((line) => {
      const token = parseCommentImageLine(line)

      if (token === null || token.id !== id) {
        return [line]
      }

      const next = map(token.spoiler)

      return next === null ? [] : [next]
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")

export function CommentComposer({
  initialContent = "",
  initialImages = [],
  placeholder,
  submitLabel,
  autoFocus = false,
  rows = 3,
  pending,
  error,
  onSubmit,
  onCancel,
}: {
  initialContent?: string
  initialImages?: readonly CommentImage[]
  placeholder: string
  submitLabel: string
  autoFocus?: boolean
  rows?: number
  pending: boolean
  error: string | null
  onSubmit: (content: string) => Promise<unknown>
  onCancel?: () => void
}) {
  const textarea = useRef<HTMLTextAreaElement | null>(null)
  const [content, setContent] = useState(initialContent)
  const [images, setImages] = useState<ReadonlyMap<string, CommentImage>>(
    () => new Map(initialImages.map((image) => [image.id, image])),
  )
  const imageIds = getCommentImageIds(content)
  const textLength = getCommentText(content).length
  const attach = (image: CommentImage) => {
    setImages((current) => new Map(current).set(image.id, image))

    if (textarea.current !== null) {
      insertAtCursor(textarea.current, commentImageToken(image.id), { block: true })
    }
  }
  const uploads = useCommentImageUploads((image) => {
    attach(toCommentImage(image))
  })
  const tooLong = textLength > config.comments.maxTextLength
  const tooManyImages = imageIds.length > config.comments.maxImages
  const empty = imageIds.length === 0 && isBlankCommentText(content)
  const blocked = empty || tooLong || tooManyImages || uploads.pending > 0 || pending
  const submit = () => {
    if (blocked) {
      return
    }

    void onSubmit(content).then(
      () => {
        setContent("")
        setImages(new Map())
      },
      () => undefined,
    )
  }
  const addFiles = (files: File[]) => {
    uploads.start(files, config.comments.maxImages - imageIds.length - uploads.pending)
  }

  return (
    <div sx={styles.root}>
      <ErrorAlert message={error} />
      <RichTextEditor
        ref={textarea}
        aria-label={placeholder}
        autoFocus={autoFocus}
        images
        onChange={(event) => {
          setContent(event.target.value)
        }}
        onFiles={addFiles}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault()
            submit()
          } else if (event.key === "Escape" && onCancel !== undefined) {
            event.preventDefault()
            onCancel()
          }
        }}
        placeholder={placeholder}
        rows={rows}
        toolbarEnd={
          <>
            <ImagePickerButton
              disabled={pending}
              onFiles={addFiles}
              onPick={(image) => {
                attach(toCommentImage(image))
              }}
            />
            <EmojiPickerButton
              disabled={pending}
              onPick={(emoji) => {
                if (textarea.current !== null) {
                  insertAtCursor(textarea.current, emoji)
                }
              }}
            />
          </>
        }
        value={content}
      />
      {imageIds.length > 0 ? (
        <div sx={styles.preview}>
          <span sx={styles.previewLabel}>{m.comments_preview()}</span>
          <CommentContent
            collapsible={false}
            content={content}
            editing={{
              toggleSpoiler: (id) => {
                setContent((current) =>
                  mapLines(current, id, (spoiler) => commentImageToken(id, !spoiler)),
                )
              },
              remove: (id) => {
                setContent((current) => mapLines(current, id, () => null))
              },
            }}
            images={[...images.values()]}
          />
        </div>
      ) : null}
      <div sx={styles.footer}>
        <span sx={styles.status}>
          {uploads.pending > 0 ? (
            <span sx={styles.uploading}>
              <Spinner />
              {m.comments_uploading({ count: uploads.pending })}
            </span>
          ) : null}
          {imageIds.length > 0 ? (
            <span sx={[styles.counter, tooManyImages && styles.over]}>
              {m.comments_image_count({ count: imageIds.length, max: config.comments.maxImages })}
            </span>
          ) : null}
          {textLength > config.comments.maxTextLength * 0.8 ? (
            <span sx={[styles.counter, tooLong && styles.over]}>
              {m.comments_counter({ count: textLength, max: config.comments.maxTextLength })}
            </span>
          ) : null}
        </span>
        <div sx={styles.actions}>
          {onCancel === undefined ? null : (
            <Button onClick={onCancel} size="sm" variant="ghost">
              {m.comments_cancel()}
            </Button>
          )}
          <Button disabled={blocked && !pending} loading={pending} onClick={submit} size="sm">
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

import * as stylex from "@stylexjs/stylex"
import { Upload } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
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
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation } from "@tanstack/react-query"
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react"
import { ErrorAlert } from "@/components/feedback/error-alert"
import {
  EDITOR_KINDS,
  type ImageCrop,
  type ImageEditorKind,
  type Size,
} from "@/features/users/components/image-editor/crop-math"
import { ImageEditorControls } from "@/features/users/components/image-editor/image-editor-controls"
import {
  ImageEditorPreviews,
  type PreviewName,
} from "@/features/users/components/image-editor/image-editor-previews"
import { ImageEditorStage } from "@/features/users/components/image-editor/image-editor-stage"
import {
  ACCEPTED_IMAGE_TYPES,
  isAnimatedFormat,
  pickImageFile,
  validateImageFile,
} from "@/features/users/components/image-editor/image-file"
import {
  createImageEditor,
  useEditorValue,
} from "@/features/users/components/image-editor/use-image-editor"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export type { ImageCrop, ImageEditorKind }

const styles = stylex.create({
  popup: {
    maxWidth: { default: "58rem", [breakpoints.maxSm]: "none" },
  },
  panel: {
    paddingInline: { default: "1rem", [breakpoints.sm]: "1.5rem" },
    paddingTop: 0,
  },
  layout: {
    gap: "1.5rem",
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr)", [breakpoints.md]: "minmax(0, 1fr) 15.5rem" },
  },
  editor: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  errors: {
    gridColumnEnd: "-1",
    gridColumnStart: "1",
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  choose: {
    marginRight: "auto",
  },
  chooseLabel: {
    display: { default: "none", [breakpoints.sm]: "inline" },
  },
  fileInput: {
    display: "none",
  },
})

type Decoded = { file: File; url: string; size: Size } | { file: File; url: null; size: null }

/** Decodes the file off the main thread before it is shown, and revokes its URL afterwards. */
const useDecodedImage = (file: File | null) => {
  const [decoded, setDecoded] = useState<Decoded | null>(null)

  useEffect(() => {
    if (file === null || validateImageFile(file) !== null) {
      return undefined
    }

    const url = URL.createObjectURL(file)
    const image = new Image()
    let cancelled = false

    image.src = url
    void image.decode().then(
      () => {
        if (!cancelled) {
          setDecoded(
            image.naturalWidth > 0 && image.naturalHeight > 0
              ? { file, url, size: { width: image.naturalWidth, height: image.naturalHeight } }
              : { file, url: null, size: null },
          )
        }
      },
      () => {
        if (!cancelled) {
          setDecoded({ file, url: null, size: null })
        }
      },
    )

    return () => {
      cancelled = true
      URL.revokeObjectURL(url)
    }
  }, [file])

  return decoded?.file === file ? decoded : null
}

/**
 * A modal to place an avatar (round) or a profile banner (3:1) before it is
 * uploaded: drag, zoom, straighten, rotate and flip, with live previews. The
 * crop it hands to `onConfirm` is what the server applies to the original.
 */
export function ImageEditorDialog({
  file,
  kind,
  onClose,
  onConfirm,
  onReplaceFile,
  previewName,
}: {
  file: File | null
  kind: ImageEditorKind
  onClose: () => void
  onConfirm: (file: File, crop: ImageCrop) => Promise<unknown>
  onReplaceFile?: (file: File) => void
  previewName?: PreviewName | undefined
}) {
  // Keeps the last file on screen while the dialog animates out.
  const [shown, setShown] = useState(file)

  if (file !== null && file !== shown) {
    setShown(file)
  }

  const lockRotation = shown !== null && isAnimatedFormat(shown)
  // Every file gets a fresh editor, so nothing carries over from the last one.
  const editor = useMemo(
    () =>
      createImageEditor({
        aspect: EDITOR_KINDS[kind].aspect,
        lockRotation: shown !== null && isAnimatedFormat(shown),
      }),
    [kind, shown],
  )
  const decoded = useDecodedImage(shown)
  const ready = useEditorValue(editor, "ready")
  const save = useMutation({
    mutationFn: ({ image, crop }: { image: File; crop: ImageCrop }) => onConfirm(image, crop),
  })
  const [replaceError, setReplaceError] = useState<string | null>(null)
  const [dropActive, setDropActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileError = shown === null ? null : validateImageFile(shown)
  const decodeError = decoded?.url === null ? m.image_editor_unreadable() : null
  const error =
    (save.isError ? getErrorMessage(save.error) : null) ?? replaceError ?? fileError ?? decodeError
  const replace = (candidate: File | null) => {
    if (candidate === null || onReplaceFile === undefined) {
      return
    }

    const invalid = validateImageFile(candidate)

    setReplaceError(invalid)

    if (invalid === null) {
      save.reset()
      onReplaceFile(candidate)
    }
  }
  const onPaste = useEffectEvent((event: ClipboardEvent) => {
    const pasted = pickImageFile(event.clipboardData?.files)

    if (pasted !== null) {
      event.preventDefault()
      replace(pasted)
    }
  })
  const canReplace = onReplaceFile !== undefined

  useEffect(() => {
    editor.setImage(decoded?.size ?? null)
  }, [editor, decoded])

  useEffect(
    () => () => {
      editor.stop()
    },
    [editor],
  )
  useEffect(() => {
    if (file === null || !canReplace) {
      return undefined
    }

    const listener = (event: ClipboardEvent) => {
      onPaste(event)
    }

    window.addEventListener("paste", listener)

    return () => {
      window.removeEventListener("paste", listener)
    }
  }, [file, canReplace])

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open && !save.isPending) {
          onClose()
        }
      }}
      onOpenChangeComplete={(open) => {
        if (!open) {
          setShown(null)
          setReplaceError(null)
          setDropActive(false)
          save.reset()
        }
      }}
      open={file !== null}
    >
      <DialogPopup sx={styles.popup}>
        <DialogHeader>
          <DialogTitle>
            {kind === "avatar" ? m.image_editor_title_avatar() : m.image_editor_title_banner()}
          </DialogTitle>
          <DialogDescription>{m.image_editor_description()}</DialogDescription>
        </DialogHeader>
        <DialogPanel sx={styles.panel}>
          <div
            onDragEnter={(event) => {
              if (canReplace && event.dataTransfer.types.includes("Files")) {
                setDropActive(true)
              }
            }}
            onDragLeave={(event) => {
              if (
                !(event.relatedTarget instanceof Node) ||
                !event.currentTarget.contains(event.relatedTarget)
              ) {
                setDropActive(false)
              }
            }}
            onDragOver={(event) => {
              if (canReplace && event.dataTransfer.types.includes("Files")) {
                event.preventDefault()
                event.dataTransfer.dropEffect = "copy"
              }
            }}
            onDrop={(event) => {
              if (!canReplace) {
                return
              }

              event.preventDefault()
              setDropActive(false)
              replace(pickImageFile(event.dataTransfer.files))
            }}
            sx={styles.layout}
          >
            {error === null ? null : (
              <div sx={styles.errors}>
                <ErrorAlert message={error} />
              </div>
            )}
            <div sx={styles.editor}>
              <ImageEditorStage
                dropActive={dropActive}
                editor={editor}
                failed={fileError !== null || decodeError !== null}
                kind={kind}
                src={decoded?.url ?? null}
              />
              <ImageEditorControls editor={editor} lockRotation={lockRotation} />
            </div>
            <ImageEditorPreviews
              editor={editor}
              kind={kind}
              previewName={previewName}
              src={decoded?.url ?? null}
            />
          </div>
        </DialogPanel>
        <DialogFooter sx={styles.footer}>
          {canReplace ? (
            <>
              <input
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                onChange={(event) => {
                  replace(pickImageFile(event.target.files))
                  event.target.value = ""
                }}
                ref={inputRef}
                sx={styles.fileInput}
                type="file"
              />
              <Button
                aria-label={m.image_editor_choose()}
                disabled={save.isPending}
                onClick={() => {
                  inputRef.current?.click()
                }}
                sx={styles.choose}
                variant="ghost"
              >
                <Upload size={16} />
                <span sx={styles.chooseLabel}>{m.image_editor_choose()}</span>
              </Button>
            </>
          ) : null}
          <DialogClose disabled={save.isPending} render={<Button variant="outline" />}>
            {m.cancel()}
          </DialogClose>
          <Button
            disabled={!ready || fileError !== null}
            loading={save.isPending}
            onClick={() => {
              const crop = editor.getCrop()

              if (crop !== null && shown !== null) {
                save.mutate({ image: shown, crop }, { onSuccess: onClose })
              }
            }}
          >
            {m.save()}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}

import * as stylex from "@stylexjs/stylex"
import { Close, EyeOff, ImageMissing, Star, Trash } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { Tooltip, TooltipPopup, TooltipTrigger } from "@taiyomoe/ui/components/ui/tooltip"
import { colors, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { use, useState } from "react"
import type { CommentImage as CommentImageData } from "@/features/comments/api/comments"
import { type Confirmation, ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import {
  useFavoriteCommentImage,
  useRemoveCommentImage,
} from "@/features/comments/api/comment-images"
import { ImageLightbox } from "@/features/comments/components/image-lightbox"
import { type CommentImageEditing, CommentsContext } from "@/features/comments/lib/comments-context"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  figure: {
    margin: 0,
    borderRadius: radius.lg,
    overflow: "hidden",
    alignSelf: "flex-start",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    display: "inline-flex",
    position: "relative",
    maxWidth: "100%",
  },
  open: {
    margin: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    cursor: "zoom-in",
    display: "block",
    outlineColor: colors.ring,
    outlineOffset: -2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    maxWidth: "100%",
  },
  image: {
    display: "block",
    objectFit: "contain",
    transitionDuration: motion.enter,
    transitionProperty: "filter",
    height: "auto",
    maxHeight: "20rem",
    maxWidth: "min(100%, 26rem)",
    width: "auto",
  },
  hidden: {
    filter: "blur(28px) saturate(0.6) brightness(0.55)",
  },
  spoilerCover: {
    inset: 0,
    borderWidth: 0,
    gap: "0.5rem",
    alignItems: "center",
    backgroundColor: "transparent",
    color: colors.foreground,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    fontSize: "0.8125rem",
    fontWeight: 600,
    justifyContent: "center",
    letterSpacing: "0.02em",
    outlineColor: colors.ring,
    outlineOffset: -2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    position: "absolute",
    textTransform: "uppercase",
  },
  spoilerPill: {
    borderRadius: radius.full,
    gap: "0.375rem",
    paddingBlock: "0.375rem",
    paddingInline: "0.75rem",
    alignItems: "center",
    backgroundColor: `color-mix(in srgb, ${colors.background} 70%, transparent)`,
    boxShadow: shadows.raised,
    display: "inline-flex",
  },
  actions: {
    padding: "0.125rem",
    borderRadius: radius.full,
    gap: "0.125rem",
    backgroundColor: `color-mix(in srgb, ${colors.background} 78%, transparent)`,
    boxShadow: shadows.raised,
    display: "flex",
    opacity: { default: 0, ":focus-within": 1 },
    position: "absolute",
    transitionDuration: motion.enter,
    transitionProperty: "opacity",
    right: "0.5rem",
    top: "0.5rem",
  },
  actionsVisible: {
    opacity: 1,
  },
  favorited: {
    color: colors.warning,
  },
  missing: {
    gap: "0.5rem",
    paddingBlock: "1.25rem",
    paddingInline: "1.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
  },
})

function ImageActions({ image, visible }: { image: CommentImageData; visible: boolean }) {
  const context = use(CommentsContext)
  const favorite = useFavoriteCommentImage()
  const remove = useRemoveCommentImage()
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)

  if (context?.viewer === null || context === null) {
    return null
  }

  const favoriteLabel = image.favorited
    ? m.comments_image_unfavorite()
    : m.comments_image_favorite()

  return (
    <>
      <div sx={[styles.actions, visible && styles.actionsVisible]}>
        <Tooltip>
          <TooltipTrigger
            delay={300}
            render={
              <Button
                aria-label={favoriteLabel}
                aria-pressed={image.favorited}
                onClick={() => {
                  favorite.mutate(
                    { id: image.id, favorited: !image.favorited },
                    {
                      onError: (error) => {
                        toastManager.add({ title: getErrorMessage(error), type: "error" })
                      },
                    },
                  )
                }}
                size="icon-xs"
                sx={image.favorited && styles.favorited}
                variant="ghost"
              />
            }
          >
            <Star />
          </TooltipTrigger>
          <TooltipPopup>{favoriteLabel}</TooltipPopup>
        </Tooltip>
        {context.canRemoveImages ? (
          <Tooltip>
            <TooltipTrigger
              delay={300}
              render={
                <Button
                  aria-label={m.comments_image_remove()}
                  onClick={() => {
                    setConfirmation({
                      title: m.comments_image_remove_title(),
                      description: m.comments_image_remove_description(),
                      confirmLabel: m.comments_image_remove(),
                      destructive: true,
                      run: () => remove.mutateAsync(image.id),
                    })
                  }}
                  size="icon-xs"
                  variant="ghost"
                />
              }
            >
              <Trash />
            </TooltipTrigger>
            <TooltipPopup>{m.comments_image_remove()}</TooltipPopup>
          </Tooltip>
        ) : null}
      </div>
      <ConfirmDialog
        confirmation={confirmation}
        error={remove.isError ? getErrorMessage(remove.error) : null}
        onClose={() => {
          setConfirmation(null)
          remove.reset()
        }}
        pending={remove.isPending}
      />
    </>
  )
}

function EditingActions({
  id,
  spoiler,
  editing,
}: {
  id: string
  spoiler: boolean
  editing: CommentImageEditing
}) {
  return (
    <div sx={[styles.actions, styles.actionsVisible]}>
      <Button
        aria-pressed={spoiler}
        onClick={() => {
          editing.toggleSpoiler(id)
        }}
        size="xs"
        variant="ghost"
      >
        <EyeOff />
        {spoiler ? m.comments_image_unspoiler() : m.comments_image_mark_spoiler()}
      </Button>
      <Button
        aria-label={m.comments_image_detach()}
        onClick={() => {
          editing.remove(id)
        }}
        size="icon-xs"
        title={m.comments_image_detach()}
        variant="ghost"
      >
        <Close />
      </Button>
    </div>
  )
}

export function CommentImage({
  id,
  image,
  spoiler,
  interactive,
  editing,
}: {
  id: string
  image: CommentImageData | null
  spoiler: boolean
  interactive: boolean
  editing: CommentImageEditing | null
}) {
  const [revealed, setRevealed] = useState(!spoiler || editing !== null)
  const [hovered, setHovered] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  if (image?.url === null || image === null) {
    return (
      <figure sx={styles.figure}>
        <span sx={styles.missing}>
          <ImageMissing />
          {image === null ? m.comments_image_unavailable() : m.comments_image_removed()}
        </span>
        {editing === null ? null : <EditingActions editing={editing} id={id} spoiler={spoiler} />}
      </figure>
    )
  }

  const picture = (
    <img
      alt=""
      decoding="async"
      height={image.height}
      loading="lazy"
      src={image.url}
      sx={[styles.image, !revealed && styles.hidden]}
      width={image.width}
    />
  )

  return (
    <figure
      onPointerEnter={() => {
        setHovered(true)
      }}
      onPointerLeave={() => {
        setHovered(false)
      }}
      sx={styles.figure}
    >
      {revealed && interactive ? (
        <button
          aria-label={m.comments_image_open()}
          onClick={() => {
            setZoomed(true)
          }}
          sx={styles.open}
          type="button"
        >
          {picture}
        </button>
      ) : (
        picture
      )}
      {revealed ? null : (
        <button
          onClick={() => {
            setRevealed(true)
          }}
          sx={styles.spoilerCover}
          type="button"
        >
          <span sx={styles.spoilerPill}>
            <EyeOff size={14} />
            {m.comments_image_spoiler()}
          </span>
        </button>
      )}
      {revealed && interactive ? <ImageActions image={image} visible={hovered} /> : null}
      {editing === null ? null : <EditingActions editing={editing} id={id} spoiler={spoiler} />}
      {interactive ? (
        <ImageLightbox
          image={zoomed ? image : null}
          onClose={() => {
            setZoomed(false)
          }}
        />
      ) : null}
    </figure>
  )
}

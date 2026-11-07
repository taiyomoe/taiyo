import * as stylex from "@stylexjs/stylex"
import { ExternalLink } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Dialog, DialogPopup, DialogTitle } from "@taiyomoe/ui/components/ui/dialog"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { CommentImage } from "@/features/comments/api/comments"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  popup: {
    padding: "0.75rem",
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    maxWidth: "min(96vw, 80rem)",
    width: "auto",
  },
  title: {
    margin: "-1px",
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: 1,
    width: 1,
  },
  image: {
    borderRadius: `calc(${radius.xxl} - 0.75rem - 1px)`,
    display: "block",
    objectFit: "contain",
    height: "auto",
    maxHeight: "82vh",
    maxWidth: "100%",
    width: "auto",
  },
})

export function ImageLightbox({
  image,
  onClose,
}: {
  image: CommentImage | null
  onClose: () => void
}) {
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open={image !== null}
    >
      <DialogPopup bottomStickOnMobile={false} sx={styles.popup}>
        <DialogTitle sx={styles.title}>{m.comments_image_open()}</DialogTitle>
        {image?.url === null || image === null ? null : (
          <>
            <img
              alt=""
              height={image.height}
              src={image.url}
              sx={styles.image}
              width={image.width}
            />
            <Button
              render={<a href={image.url} rel="noreferrer" target="_blank" />}
              size="sm"
              variant="ghost"
            >
              <ExternalLink />
              {m.comments_image_original()}
            </Button>
          </>
        )}
      </DialogPopup>
    </Dialog>
  )
}

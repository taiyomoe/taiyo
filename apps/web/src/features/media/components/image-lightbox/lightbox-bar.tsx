import * as stylex from "@stylexjs/stylex"
import { Close, Download } from "@taiyomoe/ui/components/icons"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"
import { breakpoints, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { LightboxItem } from "@/features/media/components/image-lightbox/image-lightbox"
import { OverlayButton } from "@/features/media/components/image-lightbox/overlay-button"
import { useImageDownload } from "@/features/media/hooks/use-image-download"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  bar: {
    gap: "1rem",
    paddingBlock: { default: "0.75rem", [breakpoints.sm]: "1.25rem" },
    paddingInline: { default: "0.75rem", [breakpoints.sm]: "1.5rem" },
    alignItems: "center",
    color: "rgb(255 255 255 / 92%)",
    display: "flex",
    minWidth: 0,
  },
  text: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  title: {
    margin: 0,
    overflow: "hidden",
    fontSize: "1rem",
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  detail: {
    gap: "0.5rem",
    alignItems: "center",
    color: "rgb(255 255 255 / 60%)",
    display: "flex",
    fontSize: "0.8125rem",
    minWidth: 0,
  },
  counter: {
    color: "rgb(255 255 255 / 60%)",
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  actions: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
  },
  downloadLabel: {
    display: { default: "none", [breakpoints.sm]: "inline" },
  },
  downloadButton: {
    paddingInline: { default: 0, [breakpoints.sm]: "0.875rem" },
    width: { default: "2.5rem", [breakpoints.sm]: "auto" },
  },
})

export function LightboxBar({
  item,
  index,
  count,
  onClose,
}: {
  item: LightboxItem
  index: number
  count: number
  onClose: () => void
}) {
  const { download, pending } = useImageDownload()

  return (
    <div sx={styles.bar}>
      <div sx={styles.text}>
        <p sx={styles.title}>{item.title}</p>
        {item.detail === undefined ? null : <div sx={styles.detail}>{item.detail}</div>}
      </div>
      <div sx={styles.actions}>
        {count > 1 ? (
          <span aria-live="polite" sx={styles.counter}>
            {m.media_lightbox_counter({ index: index + 1, count })}
          </span>
        ) : null}
        <OverlayButton
          disabled={pending}
          label={m.media_lightbox_download()}
          onClick={() => {
            void download(item.url, item.fileName)
          }}
          sx={styles.downloadButton}
        >
          {pending ? <Spinner /> : <Download size={18} />}
          <span sx={styles.downloadLabel}>{m.media_lightbox_download()}</span>
        </OverlayButton>
        <OverlayButton iconOnly label={m.media_lightbox_close()} onClick={onClose}>
          <Close size={18} />
        </OverlayButton>
      </div>
    </div>
  )
}

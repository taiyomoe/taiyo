import * as stylex from "@stylexjs/stylex"
import { ImageMissing } from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import type { PageReport } from "@/features/page-reports/api/page-reports"
import { ImageLightbox } from "@/features/media/components/image-lightbox/image-lightbox"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  button: {
    padding: 0,
    borderRadius: "0.375rem",
    borderWidth: 0,
    overflow: "hidden",
    aspectRatio: "2 / 3",
    backgroundColor: colors.muted,
    cursor: "zoom-in",
    display: "block",
    flexShrink: 0,
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    width: "2.25rem",
  },
  missing: {
    alignItems: "center",
    color: colors.mutedForeground,
    cursor: "default",
    display: "flex",
    justifyContent: "center",
  },
  image: {
    display: "block",
    objectFit: "cover",
    objectPosition: "top",
    height: "100%",
    width: "100%",
  },
})

/** The reported page, small in its row, full screen on a click. */
export function PageThumb({ report, label }: { report: PageReport; label: string }) {
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)

  if (report.page === null || failed) {
    return (
      <span
        sx={[styles.button, styles.missing]}
        title={failed ? m.page_reports_image_failed() : m.page_reports_page_missing()}
      >
        <ImageMissing size={16} />
      </span>
    )
  }

  return (
    <>
      <button
        aria-label={m.page_reports_view_page({ name: label })}
        onClick={() => {
          setOpen(true)
        }}
        sx={styles.button}
        type="button"
      >
        <img
          alt=""
          decoding="async"
          loading="lazy"
          onError={() => {
            setFailed(true)
          }}
          src={report.pageUrl}
          sx={styles.image}
        />
      </button>
      <ImageLightbox
        index={open ? 0 : null}
        items={[
          {
            id: report.pageId,
            url: report.pageUrl,
            title: label,
            fileName: `${report.pageId}.jpg`,
          },
        ]}
        onClose={() => {
          setOpen(false)
        }}
        onIndexChange={() => {}}
      />
    </>
  )
}

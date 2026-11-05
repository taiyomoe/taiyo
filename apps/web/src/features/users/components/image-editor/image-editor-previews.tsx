import * as stylex from "@stylexjs/stylex"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useEffect, useRef } from "react"
import type { ImageEditor } from "@/features/users/components/image-editor/use-image-editor"
import { UserName } from "@/components/user-name/user-name"
import {
  AVATAR_OVER_BANNER,
  type ImageEditorKind,
} from "@/features/users/components/image-editor/crop-math"
import { m } from "@/paraglide/messages"

export type PreviewName = { name: string; nameEffect: string | null }

const AVATAR_SIZES = [
  { size: 96, label: m.image_editor_preview_profile },
  { size: 40, label: m.image_editor_preview_comment },
  { size: 24, label: m.image_editor_preview_navbar },
] as const
const BANNER_WIDTH = 240
const BANNER_HEIGHT = BANNER_WIDTH / 3
const styles = stylex.create({
  root: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  title: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
  avatars: {
    gap: "1rem",
    alignItems: "flex-end",
    display: "flex",
    flexWrap: "wrap",
  },
  sample: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  caption: {
    color: colors.mutedForeground,
    fontSize: "0.6875rem",
  },
  box: {
    overflow: "hidden",
    backgroundColor: colors.muted,
    flexShrink: 0,
    position: "relative",
  },
  boxSize: (width: number, height: number) => ({ height, width }),
  round: {
    borderRadius: "50%",
    boxShadow: `0 0 0 1px ${colors.border}`,
  },
  bannerBox: {
    borderRadius: radius.md,
    boxShadow: `0 0 0 1px ${colors.border}`,
  },
  image: {
    pointerEvents: "none",
    position: "absolute",
    transformOrigin: "0 0",
    userSelect: "none",
    left: 0,
    maxHeight: "none",
    maxWidth: "none",
    top: 0,
  },
  comment: {
    padding: "0.625rem",
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.625rem",
    alignItems: "flex-start",
    display: "flex",
    maxWidth: BANNER_WIDTH,
    minWidth: 0,
  },
  lines: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
    paddingTop: "0.125rem",
  },
  name: {
    overflow: "hidden",
    fontSize: "0.875rem",
    fontWeight: font.weightBold,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  bar: {
    borderRadius: radius.full,
    backgroundColor: colors.muted,
    height: "0.375rem",
  },
  barWide: {
    width: "100%",
  },
  barShort: {
    width: "60%",
  },
  header: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    maxWidth: BANNER_WIDTH,
  },
  bannerWrap: {
    position: "relative",
    width: "fit-content",
  },
  avatarSpot: {
    borderColor: colors.popover,
    borderRadius: "50%",
    borderStyle: "solid",
    borderWidth: 1.5,
    backgroundColor: colors.muted,
    boxShadow: `0 1px 3px rgb(0 0 0 / 30%)`,
    position: "absolute",
  },
  avatarSpotBox: (size: number, left: number, bottom: number) => ({
    bottom,
    height: size,
    left,
    width: size,
  }),
  headerName: {
    overflow: "hidden",
    fontSize: "1rem",
    fontWeight: font.weightBold,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

/**
 * A miniature of the crop: the same image and transform as the stage, scaled
 * so the crop frame fills this box. The editor writes its transform directly.
 */
function PreviewImage({
  editor,
  src,
  width,
  height,
  round,
}: {
  editor: ImageEditor
  src: string | null
  width: number
  height: number
  round: boolean
}) {
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const element = imageRef.current

    return element === null ? undefined : editor.registerPreview(element, { width, height })
  }, [editor, src, width, height])

  return (
    <div sx={[styles.box, styles.boxSize(width, height), round ? styles.round : styles.bannerBox]}>
      {src === null ? null : (
        <img alt="" draggable={false} ref={imageRef} src={src} sx={styles.image} />
      )}
    </div>
  )
}

/** How the crop looks where it is shown around the app. */
export function ImageEditorPreviews({
  editor,
  kind,
  src,
  previewName,
}: {
  editor: ImageEditor
  kind: ImageEditorKind
  src: string | null
  previewName?: PreviewName | undefined
}) {
  return (
    <section sx={styles.root}>
      <h3 sx={styles.title}>{m.image_editor_preview()}</h3>
      {kind === "avatar" ? (
        <>
          <div sx={styles.avatars}>
            {AVATAR_SIZES.map(({ size, label }) => (
              <div key={size} sx={styles.sample}>
                <PreviewImage editor={editor} height={size} round src={src} width={size} />
                <span sx={styles.caption}>{label()}</span>
              </div>
            ))}
          </div>
          {previewName === undefined ? null : (
            <div aria-hidden="true" sx={styles.comment}>
              <PreviewImage editor={editor} height={32} round src={src} width={32} />
              <div sx={styles.lines}>
                <UserName
                  effect={previewName.nameEffect}
                  name={previewName.name}
                  sx={styles.name}
                />
                <span sx={[styles.bar, styles.barWide]} />
                <span sx={[styles.bar, styles.barShort]} />
              </div>
            </div>
          )}
        </>
      ) : (
        <div aria-hidden="true" sx={styles.header}>
          <div sx={styles.bannerWrap}>
            <PreviewImage
              editor={editor}
              height={BANNER_HEIGHT}
              round={false}
              src={src}
              width={BANNER_WIDTH}
            />
            <span
              sx={[
                styles.avatarSpot,
                styles.avatarSpotBox(
                  BANNER_HEIGHT * AVATAR_OVER_BANNER.diameter,
                  BANNER_HEIGHT * AVATAR_OVER_BANNER.inset,
                  BANNER_HEIGHT * (AVATAR_OVER_BANNER.overlap - AVATAR_OVER_BANNER.diameter),
                ),
              ]}
            />
          </div>
          {previewName === undefined ? (
            <span sx={[styles.bar, styles.barShort]} />
          ) : (
            <UserName
              effect={previewName.nameEffect}
              name={previewName.name}
              sx={styles.headerName}
            />
          )}
          <span sx={styles.caption}>{m.image_editor_preview_header()}</span>
        </div>
      )}
    </section>
  )
}

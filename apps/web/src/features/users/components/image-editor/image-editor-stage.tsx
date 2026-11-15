import * as stylex from "@stylexjs/stylex"
import { Image as ImageIcon } from "@taiyomoe/ui/components/icons"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"
import { breakpoints, colors, consts, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useCallback, useEffect, useRef } from "react"
import {
  AVATAR_OVER_BANNER,
  type ImageEditorKind,
} from "@/features/users/components/image-editor/crop-math"
import {
  type ImageEditor,
  useEditorValue,
} from "@/features/users/components/image-editor/use-image-editor"
import {
  handleStageKey,
  useStageGestures,
} from "@/features/users/components/image-editor/use-stage-gestures"
import { m } from "@/paraglide/messages"

const DIM = "rgb(9 9 11 / 64%)"
const DIM_ACTIVE = "rgb(9 9 11 / 38%)"
const RING = "0 0 0 1.5px rgb(255 255 255 / 92%), 0 0 0 4px rgb(0 0 0 / 18%)"
const styles = stylex.create({
  stage: {
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: "#0c0c0f",
    backgroundImage:
      "conic-gradient(rgb(255 255 255 / 5%) 25%, transparent 0 50%, rgb(255 255 255 / 5%) 0 75%, transparent 0)",
    backgroundSize: "18px 18px",
    cursor: { "[data-dragging]": "grabbing", default: "grab" },
    isolation: "isolate",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    position: "relative",
    touchAction: "none",
    userSelect: "none",
    width: "100%",
  },
  avatar: {
    height: { default: "min(calc(100vw - 2rem), 18rem, 44dvh)", [breakpoints.sm]: "24rem" },
  },
  banner: {
    height: { default: "12rem", [breakpoints.sm]: "18rem" },
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
  hidden: {
    visibility: "hidden",
  },
  frame: {
    boxShadow: `${RING}, 0 0 0 9999px ${DIM}`,
    pointerEvents: "none",
    position: "absolute",
    transform: "translate(-50%, -50%)",
    transitionDuration: { default: "200ms", [consts.reducedMotion]: "0s" },
    transitionProperty: "box-shadow",
    left: "50%",
    top: "50%",
  },
  frameActive: {
    boxShadow: `${RING}, 0 0 0 9999px ${DIM_ACTIVE}`,
  },
  frameSize: (width: number, height: number) => ({ height, width }),
  round: {
    borderRadius: "50%",
  },
  rounded: {
    borderRadius: radius.md,
  },
  grid: {
    inset: 0,
    borderRadius: "inherit",
    overflow: "hidden",
    opacity: 0,
    position: "absolute",
    transitionDuration: { default: "180ms", [consts.reducedMotion]: "0s" },
    transitionProperty: "opacity",
  },
  gridVisible: {
    opacity: 1,
  },
  line: {
    backgroundColor: "rgb(255 255 255 / 55%)",
    boxShadow: "0 0 2px rgb(0 0 0 / 45%)",
    position: "absolute",
  },
  vertical: {
    bottom: 0,
    top: 0,
    width: 1,
  },
  horizontal: {
    height: 1,
    left: 0,
    right: 0,
  },
  firstThird: {
    left: "33.333%",
  },
  secondThird: {
    left: "66.667%",
  },
  firstRow: {
    top: "33.333%",
  },
  secondRow: {
    top: "66.667%",
  },
  avatarHint: {
    borderColor: "rgb(255 255 255 / 75%)",
    borderRadius: "50%",
    borderStyle: "dashed",
    borderWidth: 1.5,
    backgroundColor: "rgb(255 255 255 / 16%)",
    position: "absolute",
  },
  avatarHintBox: (size: number, left: number, bottom: number) => ({
    bottom,
    height: size,
    left,
    width: size,
  }),
  loading: {
    inset: 0,
    alignItems: "center",
    color: "rgb(255 255 255 / 70%)",
    display: "flex",
    justifyContent: "center",
    position: "absolute",
  },
  skeleton: {
    inset: 0,
    borderRadius: 0,
    position: "absolute",
  },
  drop: {
    inset: 0,
    borderColor: colors.ring,
    borderRadius: "inherit",
    borderStyle: "dashed",
    borderWidth: 2,
    alignItems: "center",
    backgroundColor: "rgb(9 9 11 / 72%)",
    color: "#fff",
    display: "flex",
    fontWeight: 500,
    justifyContent: "center",
    pointerEvents: "none",
    position: "absolute",
  },
})

/**
 * The viewport the user drags in. The crop frame is fixed in its centre and
 * everything outside it is dimmed; the image moves underneath.
 */
export function ImageEditorStage({
  editor,
  kind,
  src,
  dropActive,
  failed,
}: {
  editor: ImageEditor
  kind: ImageEditorKind
  src: string | null
  dropActive: boolean
  failed: boolean
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const ready = useEditorValue(editor, "ready")
  const dragging = useEditorValue(editor, "dragging")
  const showGrid = useEditorValue(editor, "showGrid")
  const frameWidth = useEditorValue(editor, "frameWidth")
  const frameHeight = useEditorValue(editor, "frameHeight")
  const visible = ready && src !== null
  const attachImage = useCallback(
    (element: HTMLImageElement | null) => {
      editor.attachImage(element)
    },
    [editor],
  )

  useStageGestures(editor, stageRef)

  useEffect(() => {
    const element = stageRef.current

    if (element === null) {
      return undefined
    }

    const observer = new ResizeObserver(([entry]) => {
      if (entry !== undefined) {
        editor.setViewport({ width: entry.contentRect.width, height: entry.contentRect.height })
      }
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [editor])

  return (
    <div
      aria-label={m.image_editor_stage_label()}
      data-dragging={dragging ? "" : undefined}
      onKeyDown={(event) => {
        if (handleStageKey(editor, event.nativeEvent)) {
          event.preventDefault()
        }
      }}
      ref={stageRef}
      role="application"
      sx={[styles.stage, kind === "avatar" ? styles.avatar : styles.banner]}
      tabIndex={0}
    >
      {src === null ? null : (
        <img
          alt=""
          draggable={false}
          ref={attachImage}
          src={src}
          sx={[styles.image, !visible && styles.hidden]}
        />
      )}
      {visible ? (
        <div
          sx={[
            styles.frame,
            styles.frameSize(frameWidth, frameHeight),
            kind === "avatar" ? styles.round : styles.rounded,
            dragging && styles.frameActive,
          ]}
        >
          <div sx={[styles.grid, (dragging || showGrid) && styles.gridVisible]}>
            <span sx={[styles.line, styles.vertical, styles.firstThird]} />
            <span sx={[styles.line, styles.vertical, styles.secondThird]} />
            <span sx={[styles.line, styles.horizontal, styles.firstRow]} />
            <span sx={[styles.line, styles.horizontal, styles.secondRow]} />
          </div>
          {kind === "banner" ? (
            <div
              sx={[
                styles.avatarHint,
                styles.avatarHintBox(
                  frameHeight * AVATAR_OVER_BANNER.diameter,
                  frameHeight * AVATAR_OVER_BANNER.inset,
                  frameHeight * (AVATAR_OVER_BANNER.overlap - AVATAR_OVER_BANNER.diameter),
                ),
              ]}
            />
          ) : null}
        </div>
      ) : null}
      {!visible && failed ? (
        <div sx={styles.loading}>
          <ImageIcon size={32} />
        </div>
      ) : null}
      {!visible && !failed ? (
        <>
          <Skeleton sx={styles.skeleton} />
          <div sx={styles.loading}>
            <Spinner aria-label={m.image_editor_loading()} size={22} />
          </div>
        </>
      ) : null}
      {dropActive ? <div sx={styles.drop}>{m.image_editor_drop()}</div> : null}
    </div>
  )
}

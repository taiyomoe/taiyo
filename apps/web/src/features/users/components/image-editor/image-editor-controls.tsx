import {
  FlipHorizontalIcon,
  FlipVerticalIcon,
  Grid3x3Icon,
  KeyboardIcon,
  RotateLeft01Icon,
  RotateRight01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as stylex from "@stylexjs/stylex"
import { Info, Minus, Plus, Refresh } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Kbd } from "@taiyomoe/ui/components/ui/kbd"
import { Slider } from "@taiyomoe/ui/components/ui/slider"
import { Toggle } from "@taiyomoe/ui/components/ui/toggle"
import {
  Tooltip,
  TooltipPopup,
  TooltipPrimitive,
  TooltipTrigger,
} from "@taiyomoe/ui/components/ui/tooltip"
import { colors, consts } from "@taiyomoe/ui/styles/tokens.stylex"
import { Fragment, type ReactNode, useId } from "react"
import { MAX_ZOOM } from "@/features/users/components/image-editor/crop-math"
import { StraightenDial } from "@/features/users/components/image-editor/straighten-dial"
import {
  type ImageEditor,
  useEditorValue,
} from "@/features/users/components/image-editor/use-image-editor"
import { m } from "@/paraglide/messages"

type Hint = { label: string; keys: string[] }

const hintTooltip = TooltipPrimitive.createHandle<Hint | Hint[]>()
const LOG_MAX_ZOOM = Math.log(MAX_ZOOM)
const styles = stylex.create({
  root: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  group: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    alignItems: "baseline",
    display: "flex",
    fontSize: "0.8125rem",
    justifyContent: "space-between",
  },
  label: {
    color: colors.mutedForeground,
    fontWeight: 500,
  },
  value: {
    fontVariantNumeric: "tabular-nums",
    fontWeight: 500,
  },
  zoomRow: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  slider: {
    flexGrow: 1,
    minWidth: 0,
  },
  toolbar: {
    gap: "0.25rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  separator: {
    marginInline: "0.25rem",
    backgroundColor: colors.border,
    height: "1.25rem",
    width: 1,
  },
  spacer: {
    flexGrow: 1,
  },
  shortcuts: {
    display: { default: null, [consts.pointerCoarse]: "none" },
  },
  note: {
    gap: "0.5rem",
    alignItems: "flex-start",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
    lineHeight: 1.4,
  },
  noteIcon: {
    display: "flex",
    flexShrink: 0,
    marginTop: "0.0625rem",
  },
  tip: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
  },
  tipList: {
    gap: "0.375rem",
    paddingBlock: "0.25rem",
    display: "grid",
    gridTemplateColumns: "auto auto",
    textAlign: "start",
  },
  tipKeys: {
    gap: "0.25rem",
    display: "flex",
    justifyContent: "flex-end",
  },
})
const renderKeys = (keys: string[]) => keys.map((key) => <Kbd key={key}>{key}</Kbd>)

function ToolButton({
  hint,
  disabled,
  onClick,
  children,
}: {
  hint: Hint
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <TooltipTrigger
      delay={300}
      handle={hintTooltip}
      payload={hint}
      render={
        <Button
          aria-label={hint.label}
          disabled={disabled}
          onClick={onClick}
          size="icon"
          variant="ghost"
        />
      }
    >
      {children}
    </TooltipTrigger>
  )
}

/** Zoom, straighten, rotate, flip, grid and reset. */
export function ImageEditorControls({
  editor,
  lockRotation,
}: {
  editor: ImageEditor
  lockRotation: boolean
}) {
  const ready = useEditorValue(editor, "ready")
  const zoom = useEditorValue(editor, "zoom")
  const showGrid = useEditorValue(editor, "showGrid")
  const pristine = useEditorValue(editor, "pristine")
  const zoomLabelId = useId()
  const shortcuts: Hint[] = [
    { label: m.image_editor_shortcut_move(), keys: ["←", "↑", "→", "↓"] },
    { label: m.image_editor_zoom(), keys: ["+", "−"] },
    ...(lockRotation ? [] : [{ label: m.image_editor_shortcut_rotate(), keys: ["R", "⇧R"] }]),
    { label: m.image_editor_shortcut_flip(), keys: ["H", "V"] },
    { label: m.image_editor_grid(), keys: ["G"] },
    { label: m.image_editor_reset(), keys: ["0"] },
  ]

  return (
    <div sx={styles.root}>
      <div sx={styles.group}>
        <div sx={styles.header}>
          <span id={zoomLabelId} sx={styles.label}>
            {m.image_editor_zoom()}
          </span>
          <span sx={styles.value}>{`${zoom.toFixed(2)}×`}</span>
        </div>
        <div sx={styles.zoomRow}>
          <ToolButton
            disabled={!ready || zoom <= 1}
            hint={{ label: m.image_editor_zoom_out(), keys: ["−"] }}
            onClick={() => {
              editor.stepZoom(-1)
            }}
          >
            <Minus size={18} />
          </ToolButton>
          <Slider
            aria-labelledby={zoomLabelId}
            disabled={!ready}
            max={1}
            min={0}
            onValueChange={(value) => {
              const position = typeof value === "number" ? value : (value[0] ?? 0)

              editor.setZoom(Math.exp(position * LOG_MAX_ZOOM))
            }}
            step={0.001}
            sx={styles.slider}
            value={Math.log(Math.max(zoom, 1)) / LOG_MAX_ZOOM}
          />
          <ToolButton
            disabled={!ready || zoom >= MAX_ZOOM}
            hint={{ label: m.image_editor_zoom_in(), keys: ["+"] }}
            onClick={() => {
              editor.stepZoom(1)
            }}
          >
            <Plus size={18} />
          </ToolButton>
        </div>
      </div>
      <StraightenDial disabled={!ready || lockRotation} editor={editor} />
      <div sx={styles.toolbar}>
        <ToolButton
          disabled={!ready || lockRotation}
          hint={{ label: m.image_editor_rotate_left(), keys: ["⇧R"] }}
          onClick={() => {
            editor.rotate(-1)
          }}
        >
          <HugeiconsIcon icon={RotateLeft01Icon} size={18} />
        </ToolButton>
        <ToolButton
          disabled={!ready || lockRotation}
          hint={{ label: m.image_editor_rotate_right(), keys: ["R"] }}
          onClick={() => {
            editor.rotate(1)
          }}
        >
          <HugeiconsIcon icon={RotateRight01Icon} size={18} />
        </ToolButton>
        <span aria-hidden="true" sx={styles.separator} />
        <ToolButton
          disabled={!ready}
          hint={{ label: m.image_editor_flip_horizontal(), keys: ["H"] }}
          onClick={() => {
            editor.flip("x")
          }}
        >
          <HugeiconsIcon icon={FlipHorizontalIcon} size={18} />
        </ToolButton>
        <ToolButton
          disabled={!ready}
          hint={{ label: m.image_editor_flip_vertical(), keys: ["V"] }}
          onClick={() => {
            editor.flip("y")
          }}
        >
          <HugeiconsIcon icon={FlipVerticalIcon} size={18} />
        </ToolButton>
        <span aria-hidden="true" sx={styles.separator} />
        <TooltipTrigger
          delay={300}
          handle={hintTooltip}
          payload={{ label: m.image_editor_grid(), keys: ["G"] }}
          render={
            <Toggle
              aria-label={m.image_editor_grid()}
              disabled={!ready}
              onPressedChange={() => {
                editor.toggleGrid()
              }}
              pressed={showGrid}
            />
          }
        >
          <HugeiconsIcon icon={Grid3x3Icon} size={18} />
        </TooltipTrigger>
        <span sx={styles.spacer} />
        <TooltipTrigger
          delay={300}
          handle={hintTooltip}
          payload={shortcuts}
          render={
            <Button
              aria-label={m.image_editor_shortcuts()}
              size="icon"
              sx={styles.shortcuts}
              variant="ghost"
            />
          }
        >
          <HugeiconsIcon icon={KeyboardIcon} size={18} />
        </TooltipTrigger>
        <Button
          disabled={!ready || pristine}
          onClick={() => {
            editor.reset()
          }}
          size="sm"
          variant="outline"
        >
          <Refresh size={16} />
          {m.image_editor_reset()}
        </Button>
      </div>
      {lockRotation ? (
        <p sx={styles.note}>
          <span sx={styles.noteIcon}>
            <Info size={16} />
          </span>
          {m.image_editor_gif_note()}
        </p>
      ) : null}
      <Tooltip handle={hintTooltip}>
        {({ payload }) =>
          payload === undefined ? null : (
            <TooltipPopup>
              {Array.isArray(payload) ? (
                <span sx={styles.tipList}>
                  {payload.map((hint) => (
                    <Fragment key={hint.label}>
                      <span>{hint.label}</span>
                      <span sx={styles.tipKeys}>{renderKeys(hint.keys)}</span>
                    </Fragment>
                  ))}
                </span>
              ) : (
                <span sx={styles.tip}>
                  {payload.label}
                  {renderKeys(payload.keys)}
                </span>
              )}
            </TooltipPopup>
          )
        }
      </Tooltip>
    </div>
  )
}

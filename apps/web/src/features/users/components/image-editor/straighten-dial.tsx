import * as stylex from "@stylexjs/stylex"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useId, useRef } from "react"
import { range } from "remeda"
import {
  type ImageEditor,
  STRAIGHTEN_LIMIT,
  useEditorValue,
} from "@/features/users/components/image-editor/use-image-editor"
import { m } from "@/paraglide/messages"

const PX_PER_DEGREE = 8
const SNAP_DEGREES = 1
const RULER_WIDTH = STRAIGHTEN_LIMIT * 2 * PX_PER_DEGREE
const RULER_HEIGHT = 44
const KEY_STEPS: Record<string, number | undefined> = {
  ArrowLeft: -0.5,
  ArrowDown: -0.5,
  ArrowRight: 0.5,
  ArrowUp: 0.5,
  PageDown: -5,
  PageUp: 5,
}
const styles = stylex.create({
  root: {
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
  dial: {
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    cursor: "ew-resize",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    position: "relative",
    touchAction: "none",
    userSelect: "none",
    height: RULER_HEIGHT,
  },
  disabled: {
    cursor: "not-allowed",
    opacity: 0.5,
  },
  ruler: {
    color: colors.mutedForeground,
    position: "absolute",
    left: "50%",
    top: 0,
  },
  fade: {
    inset: 0,
    backgroundImage: `linear-gradient(to right, ${colors.well}, transparent 22%, transparent 78%, ${colors.well})`,
    pointerEvents: "none",
    position: "absolute",
  },
  offset: (x: number) => ({
    transform: `translateX(${x}px)`,
  }),
  needle: {
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    position: "absolute",
    bottom: 5,
    left: "50%",
    marginLeft: -1,
    top: 5,
    width: 2,
  },
})
const tickHeight = (degrees: number) => {
  if (degrees % 15 === 0) {
    return 16
  }

  return degrees % 5 === 0 ? 11 : 6
}
const RULER = (
  <svg
    aria-hidden="true"
    height={RULER_HEIGHT}
    viewBox={`-4 0 ${RULER_WIDTH + 8} ${RULER_HEIGHT}`}
    width={RULER_WIDTH + 8}
  >
    {range(-STRAIGHTEN_LIMIT, STRAIGHTEN_LIMIT + 1).map((degrees) => {
      const x = (degrees + STRAIGHTEN_LIMIT) * PX_PER_DEGREE

      return (
        <line
          key={degrees}
          opacity={degrees % 5 === 0 ? 0.9 : 0.45}
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth={degrees % 15 === 0 ? 1.5 : 1}
          x1={x}
          x2={x}
          y1={RULER_HEIGHT - 8 - tickHeight(degrees)}
          y2={RULER_HEIGHT - 8}
        />
      )
    })}
    {range(-STRAIGHTEN_LIMIT / 15, STRAIGHTEN_LIMIT / 15 + 1).map((step) => (
      <text
        fill="currentColor"
        fontSize={9}
        key={step}
        textAnchor="middle"
        x={(step * 15 + STRAIGHTEN_LIMIT) * PX_PER_DEGREE}
        y={11}
      >
        {step * 15}
      </text>
    ))}
  </svg>
)
const formatDegrees = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}°`

/**
 * A ruler you drag sideways to straighten the image, with a detent at 0°.
 * Keyboard: arrows step 0.5°, Page Up/Down 5°, Home/End jump to the limits.
 */
export function StraightenDial({ editor, disabled }: { editor: ImageEditor; disabled: boolean }) {
  const value = useEditorValue(editor, "straighten")
  const drag = useRef<{ pointerId: number; startX: number; startValue: number } | null>(null)
  const labelId = useId()

  return (
    <div sx={styles.root}>
      <div sx={styles.header}>
        <span id={labelId} sx={styles.label}>
          {m.image_editor_straighten()}
        </span>
        <span sx={styles.value}>{formatDegrees(value)}</span>
      </div>
      <div
        aria-disabled={disabled}
        aria-labelledby={labelId}
        aria-orientation="horizontal"
        aria-valuemax={STRAIGHTEN_LIMIT}
        aria-valuemin={-STRAIGHTEN_LIMIT}
        aria-valuenow={value}
        aria-valuetext={formatDegrees(value)}
        onDoubleClick={() => {
          editor.setStraighten(0)
        }}
        onKeyDown={(event) => {
          const step = KEY_STEPS[event.key]
          const jumps: Record<string, number | undefined> = {
            Home: -STRAIGHTEN_LIMIT,
            End: STRAIGHTEN_LIMIT,
          }
          const jump = jumps[event.key]

          if (disabled || (step === undefined && jump === undefined)) {
            return
          }

          event.preventDefault()
          editor.setStraighten(jump ?? value + (step ?? 0) * (event.shiftKey ? 10 : 1))
        }}
        onLostPointerCapture={() => {
          drag.current = null
        }}
        onPointerDown={(event) => {
          if (disabled || (event.pointerType === "mouse" && event.button !== 0)) {
            return
          }

          event.currentTarget.setPointerCapture(event.pointerId)
          drag.current = { pointerId: event.pointerId, startX: event.clientX, startValue: value }
        }}
        onPointerMove={(event) => {
          if (drag.current?.pointerId !== event.pointerId) {
            return
          }

          // Dragging the ruler left brings larger angles under the needle.
          const next =
            drag.current.startValue - (event.clientX - drag.current.startX) / PX_PER_DEGREE

          editor.setStraighten(Math.abs(next) < SNAP_DEGREES ? 0 : next)
        }}
        onPointerUp={() => {
          drag.current = null
        }}
        role="slider"
        sx={[styles.dial, disabled && styles.disabled]}
        tabIndex={disabled ? -1 : 0}
      >
        <div sx={[styles.ruler, styles.offset(-(value + STRAIGHTEN_LIMIT) * PX_PER_DEGREE - 4)]}>
          {RULER}
        </div>
        <span sx={styles.fade} />
        <span sx={styles.needle} />
      </div>
    </div>
  )
}

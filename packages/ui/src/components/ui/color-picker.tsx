import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import * as stylex from "@stylexjs/stylex"
import * as React from "react"
import type { Sx } from "../../styles/sx"
import { focus } from "../../styles/recipes"
import { colors, font, radius, shadows } from "../../styles/tokens.stylex"
import { type Hsv, hexToHsv, hsvToHex, parseHex } from "../../utils/color"
import { Check, Pipette } from "../icons"
import { Button } from "./button"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "./input-group"
import { Popover, PopoverPopup, PopoverTrigger } from "./popover"

declare global {
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface Window {
    EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> }
  }
}

const KEY_STEP = 1
const KEY_STEP_LARGE = 10
const styles = stylex.create({
  trigger: {
    justifyContent: "flex-start",
  },
  triggerValue: {
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    textTransform: "uppercase",
  },
  swatch: (color: string) => ({
    borderColor: colors.input,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: color,
    boxShadow: shadows.chip,
    flexShrink: 0,
    height: "1.125rem",
    width: "1.125rem",
  }),
  popup: {
    width: "16rem",
  },
  body: {
    gap: "0.875rem",
    display: "flex",
    flexDirection: "column",
  },
  area: (hue: number) => ({
    borderRadius: radius.md,
    backgroundColor: `hsl(${hue} 100% 50%)`,
    backgroundImage:
      "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
    boxShadow: shadows.sunken,
    cursor: "crosshair",
    position: "relative",
    touchAction: "none",
    userSelect: "none",
    height: "9.5rem",
  }),
  areaThumb: (x: number, y: number, color: string) => ({
    borderColor: "#fff",
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 2,
    backgroundColor: color,
    boxShadow: shadows.thumb,
    position: "absolute",
    translate: "-50% -50%",
    height: "1rem",
    left: `${x}%`,
    top: `${y}%`,
    width: "1rem",
  }),
  hueControl: {
    alignItems: "center",
    display: "flex",
    touchAction: "none",
    userSelect: "none",
    height: "1rem",
  },
  hueTrack: {
    borderRadius: radius.full,
    backgroundImage:
      "linear-gradient(to right, #f00, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00)",
    boxShadow: shadows.sunken,
    flexGrow: 1,
    position: "relative",
    height: "0.625rem",
  },
  hueThumb: (hue: number) => ({
    borderColor: "#fff",
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 2,
    backgroundColor: `hsl(${hue} 100% 50%)`,
    boxShadow: shadows.thumb,
    display: "block",
    height: "1rem",
    width: "1rem",
  }),
  row: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  hexField: {
    flexGrow: 1,
    minWidth: 0,
  },
  hexInput: {
    fontFamily: font.mono,
    textTransform: "uppercase",
  },
  presets: {
    gap: "0.375rem",
    display: "grid",
    gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
  },
  preset: (color: string) => ({
    padding: 0,
    borderColor: colors.input,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "center",
    aspectRatio: "1",
    backgroundColor: color,
    boxShadow: shadows.chip,
    cursor: "pointer",
    display: "inline-flex",
    justifyContent: "center",
  }),
  presetCheck: (color: string) => ({
    color,
  }),
})
const isLight = (hex: string) => hexToHsv(hex).v > 70 && hexToHsv(hex).s < 40

function ColorArea({ hsv, onChange }: { hsv: Hsv; onChange: (next: Hsv) => void }) {
  const thumb = React.useRef<HTMLDivElement | null>(null)
  const pick = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
    const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1)

    onChange({ ...hsv, s: x * 100, v: (1 - y) * 100 })
  }

  return (
    <div
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        pick(event)
        thumb.current?.focus()
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          pick(event)
        }
      }}
      sx={styles.area(hsv.h)}
    >
      <div
        aria-label="Saturation and brightness"
        aria-valuetext={`Saturation ${Math.round(hsv.s)}%, brightness ${Math.round(hsv.v)}%`}
        onKeyDown={(event) => {
          const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP
          const delta = {
            ArrowLeft: { s: -step, v: 0 },
            ArrowRight: { s: step, v: 0 },
            ArrowUp: { s: 0, v: step },
            ArrowDown: { s: 0, v: -step },
          }[event.key]

          if (delta !== undefined) {
            event.preventDefault()
            onChange({
              ...hsv,
              s: Math.min(Math.max(hsv.s + delta.s, 0), 100),
              v: Math.min(Math.max(hsv.v + delta.v, 0), 100),
            })
          }
        }}
        ref={thumb}
        role="slider"
        sx={[focus.control, styles.areaThumb(hsv.s, 100 - hsv.v, hsvToHex(hsv))]}
        tabIndex={0}
      />
    </div>
  )
}

function HueSlider({ hsv, onChange }: { hsv: Hsv; onChange: (next: Hsv) => void }) {
  const controlProps = stylex.props(styles.hueControl)
  const trackProps = stylex.props(styles.hueTrack)
  const thumbProps = stylex.props(focus.control, styles.hueThumb(hsv.h))

  return (
    <SliderPrimitive.Root
      max={360}
      min={0}
      onValueChange={(next: number | readonly number[]) => {
        onChange({ ...hsv, h: typeof next === "number" ? next : (next[0] ?? hsv.h) })
      }}
      thumbAlignment="edge"
      value={hsv.h}
    >
      <SliderPrimitive.Control className={controlProps.className} style={controlProps.style}>
        <SliderPrimitive.Track className={trackProps.className} style={trackProps.style}>
          <SliderPrimitive.Thumb
            aria-label="Hue"
            className={thumbProps.className}
            style={thumbProps.style}
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

function HexField({ hex, onChange }: { hex: string; onChange: (hex: string) => void }) {
  const commit = (input: HTMLInputElement) => {
    const parsed = parseHex(input.value)

    if (parsed === null) {
      input.value = hex.slice(1)
    } else if (parsed !== hex) {
      onChange(parsed)
    }
  }

  return (
    <InputGroup sx={styles.hexField}>
      <InputGroupAddon>
        <InputGroupText>#</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        aria-label="Hex color"
        defaultValue={hex.slice(1)}
        key={hex}
        maxLength={7}
        onBlur={(event) => {
          commit(event.currentTarget)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            commit(event.currentTarget)
          }
        }}
        size="sm"
        spellCheck={false}
        sx={styles.hexInput}
      />
    </InputGroup>
  )
}

export function ColorPicker({
  value,
  onChange,
  presets = [],
  sx,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "value" | "onChange"> & {
  value: string
  onChange: (hex: string) => void
  presets?: readonly string[]
  sx?: Sx
}): React.ReactElement {
  const hex = parseHex(value) ?? "#000000"
  const [state, setState] = React.useState(() => ({ hex, hsv: hexToHsv(hex) }))
  const hsv = state.hex === hex ? state.hsv : hexToHsv(hex)
  const [eyeDropper, setEyeDropper] = React.useState(false)
  const update = (next: Hsv) => {
    const nextHex = hsvToHex(next)

    setState({ hex: nextHex, hsv: next })
    onChange(nextHex)
  }
  const updateHex = (nextHex: string) => {
    setState({ hex: nextHex, hsv: hexToHsv(nextHex) })
    onChange(nextHex)
  }

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) {
          setEyeDropper(window.EyeDropper !== undefined)
        }
      }}
    >
      <PopoverTrigger render={<Button sx={[styles.trigger, sx]} variant="outline" {...props} />}>
        <span sx={styles.swatch(hex)} />
        <span sx={styles.triggerValue}>{hex}</span>
      </PopoverTrigger>
      <PopoverPopup align="start" sx={styles.popup}>
        <div data-slot="color-picker" sx={styles.body}>
          <ColorArea hsv={hsv} onChange={update} />
          <HueSlider hsv={hsv} onChange={update} />
          <div sx={styles.row}>
            <HexField hex={hex} onChange={updateHex} />
            {eyeDropper ? (
              <Button
                aria-label="Pick a color from the screen"
                onClick={() => {
                  const EyeDropper = window.EyeDropper

                  if (EyeDropper !== undefined) {
                    void new EyeDropper()
                      .open()
                      .then((result) => {
                        const picked = parseHex(result.sRGBHex)

                        if (picked !== null) {
                          updateHex(picked)
                        }
                      })
                      .catch(() => undefined)
                  }
                }}
                size="icon-sm"
                title="Pick a color from the screen"
                variant="outline"
              >
                <Pipette />
              </Button>
            ) : null}
          </div>
          {presets.length === 0 ? null : (
            <div sx={styles.presets}>
              {presets.map((preset) => (
                <button
                  aria-label={preset}
                  aria-pressed={preset === hex}
                  key={preset}
                  onClick={() => {
                    updateHex(preset)
                  }}
                  sx={[focus.control, styles.preset(preset)]}
                  title={preset}
                  type="button"
                >
                  {preset === hex ? (
                    <Check
                      height={12}
                      sx={styles.presetCheck(isLight(preset) ? "#000" : "#fff")}
                      width={12}
                    />
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverPopup>
    </Popover>
  )
}

"use client"

import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import * as stylex from "@stylexjs/stylex"
import * as React from "react"
import { cn } from "@/lib/utils"
import type { Sx } from "../../styles/sx"
import { colors, radius, shadows } from "../../styles/tokens.stylex"

const styles = stylex.create({
  root: {
    width: {
      '[data-orientation="horizontal"]': "100%",
      default: null,
    },
  },
  control: {
    display: "flex",
    flexDirection: {
      '[data-orientation="vertical"]': "column",
      default: null,
    },
    opacity: {
      "[data-disabled]": 0.64,
      default: null,
    },
    pointerEvents: {
      "[data-disabled]": "none",
      default: null,
    },
    touchAction: "none",
    userSelect: "none",
    height: {
      '[data-orientation="vertical"]': "100%",
      default: null,
    },
    minHeight: {
      '[data-orientation="vertical"]': "11rem",
      default: null,
    },
    minWidth: {
      '[data-orientation="horizontal"]': "11rem",
      default: null,
    },
    width: {
      '[data-orientation="horizontal"]': "100%",
      default: null,
    },
  },
  // The rail is the sunken well the red indicator rides in.
  track: {
    flexGrow: 1,
    position: "relative",
    userSelect: "none",
    height: {
      '[data-orientation="horizontal"]': "0.25rem",
      '[data-orientation="vertical"]': "100%",
      default: null,
    },
    width: {
      '[data-orientation="horizontal"]': "100%",
      '[data-orientation="vertical"]': "0.25rem",
      default: null,
    },
    "::before": {
      borderRadius: radius.full,
      insetBlock: {
        '[data-orientation="horizontal"]': 0,
        '[data-orientation="vertical"]': "0.125rem",
        default: null,
      },
      insetInline: {
        '[data-orientation="horizontal"]': "0.125rem",
        '[data-orientation="vertical"]': 0,
        default: null,
      },
      backgroundColor: colors.well,
      boxShadow: shadows.sunken,
      content: '""',
      position: "absolute",
    },
  },
  indicator: {
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    userSelect: "none",
    marginBottom: {
      '[data-orientation="vertical"]': "0.125rem",
      default: null,
    },
    marginLeft: {
      '[data-orientation="horizontal"]': "0.125rem",
      default: null,
    },
  },
  thumb: {
    borderColor: colors.input,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: "#fff",
    boxShadow: {
      "[data-dragging]": "none",
      default: shadows.thumb,
    },
    display: "block",
    flexShrink: 0,
    outlineColor: `color-mix(in srgb, ${colors.ring} 24%, transparent)`,
    outlineStyle: {
      default: "none",
      ":focus-within": "solid",
    },
    outlineWidth: 3,
    scale: {
      "[data-dragging]": "1.2",
      default: null,
    },
    transitionProperty: "box-shadow, scale",
    userSelect: "none",
    height: "1rem",
    width: "1rem",
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: "0 1px rgb(0 0 0 / 4%)",
      content: '""',
      position: "absolute",
    },
  },
  value: {
    display: "flex",
    fontSize: "0.875rem",
    justifyContent: "flex-end",
    lineHeight: "1.25rem",
  },
})

export function Slider({
  className,
  children,
  defaultValue,
  value,
  min = 0,
  max = 100,
  sx,
  ...props
}: SliderPrimitive.Root.Props & { sx?: Sx }): React.ReactElement {
  const _values = React.useMemo(() => {
    if (value !== undefined) {
      return Array.isArray(value) ? value : [value]
    }

    if (defaultValue !== undefined) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue]
    }

    return [min]
  }, [value, defaultValue, min])
  const rootProps = stylex.props(styles.root, sx)
  const controlProps = stylex.props(styles.control)
  const trackProps = stylex.props(styles.track)
  const indicatorProps = stylex.props(styles.indicator)
  const thumbProps = stylex.props(styles.thumb)

  return (
    <SliderPrimitive.Root
      className={cn(rootProps.className, className)}
      defaultValue={defaultValue}
      max={max}
      min={min}
      style={rootProps.style}
      thumbAlignment="edge"
      value={value}
      {...props}
    >
      {children}
      <SliderPrimitive.Control
        className={controlProps.className}
        data-slot="slider-control"
        style={controlProps.style}
      >
        <SliderPrimitive.Track
          className={trackProps.className}
          data-slot="slider-track"
          style={trackProps.style}
        >
          <SliderPrimitive.Indicator
            className={indicatorProps.className}
            data-slot="slider-indicator"
            style={indicatorProps.style}
          />
          {Array.from({ length: _values.length }, (_, index) => (
            <SliderPrimitive.Thumb
              className={thumbProps.className}
              data-slot="slider-thumb"
              index={index}
              key={String(index)}
              style={thumbProps.style}
            />
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export function SliderValue({
  className,
  sx,
  ...props
}: SliderPrimitive.Value.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.value, sx)

  return (
    <SliderPrimitive.Value
      className={cn(styleProps.className, className)}
      data-slot="slider-value"
      style={styleProps.style}
      {...props}
    />
  )
}

export { SliderPrimitive }

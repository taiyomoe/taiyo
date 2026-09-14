"use client"

import { Meter as MeterPrimitive } from "@base-ui/react/meter"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/lib/utils"
import type { Sx } from "../../styles/sx"
import { colors, shadows } from "../../styles/tokens.stylex"

const styles = stylex.create({
  root: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  label: {
    color: colors.foreground,
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: "1.25rem",
  },
  track: {
    overflow: "hidden",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    display: "block",
    height: "0.5rem",
    width: "100%",
  },
  indicator: {
    backgroundColor: colors.primary,
    transitionDuration: "500ms",
    transitionProperty: "all",
  },
  value: {
    color: colors.foreground,
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
    lineHeight: "1.25rem",
  },
})

export function Meter({
  className,
  children,
  sx,
  ...props
}: MeterPrimitive.Root.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.root, sx)

  return (
    <MeterPrimitive.Root
      className={cn(styleProps.className, className)}
      data-slot="meter"
      style={styleProps.style}
      {...props}
    >
      {children ? (
        children
      ) : (
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      )}
    </MeterPrimitive.Root>
  )
}

export function MeterLabel({
  className,
  sx,
  ...props
}: MeterPrimitive.Label.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.label, sx)

  return (
    <MeterPrimitive.Label
      className={cn(styleProps.className, className)}
      data-slot="meter-label"
      style={styleProps.style}
      {...props}
    />
  )
}

export function MeterTrack({
  className,
  sx,
  ...props
}: MeterPrimitive.Track.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.track, sx)

  return (
    <MeterPrimitive.Track
      className={cn(styleProps.className, className)}
      data-slot="meter-track"
      style={styleProps.style}
      {...props}
    />
  )
}

export function MeterIndicator({
  className,
  sx,
  ...props
}: MeterPrimitive.Indicator.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.indicator, sx)

  return (
    <MeterPrimitive.Indicator
      className={cn(styleProps.className, className)}
      data-slot="meter-indicator"
      style={styleProps.style}
      {...props}
    />
  )
}

export function MeterValue({
  className,
  sx,
  ...props
}: MeterPrimitive.Value.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.value, sx)

  return (
    <MeterPrimitive.Value
      className={cn(styleProps.className, className)}
      data-slot="meter-value"
      style={styleProps.style}
      {...props}
    />
  )
}

export { MeterPrimitive }

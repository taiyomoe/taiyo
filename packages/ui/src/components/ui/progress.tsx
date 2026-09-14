"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/lib/utils"
import type { Sx } from "../../styles/sx"
import { colors, radius, shadows } from "../../styles/tokens.stylex"

const styles = stylex.create({
  root: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: "1.25rem",
  },
  track: {
    borderRadius: radius.full,
    overflow: "hidden",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    display: "block",
    height: "0.375rem",
    width: "100%",
  },
  indicator: {
    backgroundColor: colors.primary,
    transitionDuration: "500ms",
    transitionProperty: "all",
  },
  value: {
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
    lineHeight: "1.25rem",
  },
})

export function Progress({
  className,
  children,
  sx,
  ...props
}: ProgressPrimitive.Root.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.root, sx)

  return (
    <ProgressPrimitive.Root
      className={cn(styleProps.className, className)}
      data-slot="progress"
      style={styleProps.style}
      {...props}
    >
      {children ? (
        children
      ) : (
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      )}
    </ProgressPrimitive.Root>
  )
}

export function ProgressLabel({
  className,
  sx,
  ...props
}: ProgressPrimitive.Label.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.label, sx)

  return (
    <ProgressPrimitive.Label
      className={cn(styleProps.className, className)}
      data-slot="progress-label"
      style={styleProps.style}
      {...props}
    />
  )
}

export function ProgressTrack({
  className,
  sx,
  ...props
}: ProgressPrimitive.Track.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.track, sx)

  return (
    <ProgressPrimitive.Track
      className={cn(styleProps.className, className)}
      data-slot="progress-track"
      style={styleProps.style}
      {...props}
    />
  )
}

export function ProgressIndicator({
  className,
  sx,
  ...props
}: ProgressPrimitive.Indicator.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.indicator, sx)

  return (
    <ProgressPrimitive.Indicator
      className={cn(styleProps.className, className)}
      data-slot="progress-indicator"
      style={styleProps.style}
      {...props}
    />
  )
}

export function ProgressValue({
  className,
  sx,
  ...props
}: ProgressPrimitive.Value.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.value, sx)

  return (
    <ProgressPrimitive.Value
      className={cn(styleProps.className, className)}
      data-slot="progress-value"
      style={styleProps.style}
      {...props}
    />
  )
}

export { ProgressPrimitive }

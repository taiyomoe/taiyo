"use client"

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/lib/utils"
import type { Sx } from "../../styles/sx"
import { colors, radius } from "../../styles/tokens.stylex"

const styles = stylex.create({
  root: {
    borderRadius: radius.full,
    overflow: "hidden",
    alignItems: "center",
    backgroundColor: colors.background,
    display: "inline-flex",
    flexShrink: 0,
    fontSize: "0.75rem",
    fontWeight: 500,
    justifyContent: "center",
    lineHeight: "1rem",
    userSelect: "none",
    verticalAlign: "middle",
    height: "2rem",
    width: "2rem",
  },
  image: {
    objectFit: "cover",
    height: "100%",
    width: "100%",
  },
  fallback: {
    borderRadius: radius.full,
    alignItems: "center",
    backgroundColor: colors.muted,
    display: "flex",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
})

export function Avatar({
  className,
  sx,
  ...props
}: AvatarPrimitive.Root.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.root, sx)

  return (
    <AvatarPrimitive.Root
      className={cn(styleProps.className, className)}
      data-slot="avatar"
      style={styleProps.style}
      {...props}
    />
  )
}

export function AvatarImage({
  className,
  sx,
  ...props
}: AvatarPrimitive.Image.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.image, sx)

  return (
    <AvatarPrimitive.Image
      className={cn(styleProps.className, className)}
      data-slot="avatar-image"
      style={styleProps.style}
      {...props}
    />
  )
}

export function AvatarFallback({
  className,
  sx,
  ...props
}: AvatarPrimitive.Fallback.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.fallback, sx)

  return (
    <AvatarPrimitive.Fallback
      className={cn(styleProps.className, className)}
      data-slot="avatar-fallback"
      style={styleProps.style}
      {...props}
    />
  )
}

export { AvatarPrimitive }

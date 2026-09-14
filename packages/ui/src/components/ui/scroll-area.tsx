"use client"

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/lib/utils"
import type { Sx } from "../../styles/sx"
import { colors, radius } from "../../styles/tokens.stylex"

const styles = stylex.create({
  root: {
    height: "100%",
    minHeight: 0,
    width: "100%",
  },
  viewport: {
    borderRadius: "inherit",
    outlineColor: colors.ring,
    outlineOffset: 1,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
    height: "100%",
    overscrollBehaviorX: {
      "[data-has-overflow-x]": "contain",
      default: null,
    },
    overscrollBehaviorY: {
      "[data-has-overflow-y]": "contain",
      default: null,
    },
  },
  // Soft edges that appear only on the sides that actually overflow.
  viewportFade: {
    "--fade-size": "1.5rem",
    maskComposite: "intersect",
    maskImage:
      "linear-gradient(to bottom, transparent, #000 min(var(--fade-size), var(--scroll-area-overflow-y-start)), #000 calc(100% - min(var(--fade-size), var(--scroll-area-overflow-y-end))), transparent), linear-gradient(to right, transparent, #000 min(var(--fade-size), var(--scroll-area-overflow-x-start)), #000 calc(100% - min(var(--fade-size), var(--scroll-area-overflow-x-end))), transparent)",
  },
  viewportGutter: {
    paddingBottom: {
      "[data-has-overflow-x]": "0.625rem",
      default: null,
    },
    paddingRight: {
      "[data-has-overflow-y]": "0.625rem",
      default: null,
    },
  },
  contentFill: {
    height: "100%",
    width: "100%",
  },
  scrollbar: {
    margin: "0.25rem",
    display: "flex",
    flexDirection: {
      '[data-orientation="horizontal"]': "column",
      default: null,
    },
    opacity: {
      "[data-hovering]": 1,
      "[data-scrolling]": 1,
      default: 0,
    },
    transitionDelay: {
      "[data-hovering]": "0s",
      "[data-scrolling]": "0s",
      default: "300ms",
    },
    transitionDuration: {
      "[data-hovering]": "100ms",
      "[data-scrolling]": "100ms",
      default: null,
    },
    transitionProperty: "opacity",
    height: {
      '[data-orientation="horizontal"]': "0.375rem",
      default: null,
    },
    width: {
      '[data-orientation="vertical"]': "0.375rem",
      default: null,
    },
  },
  thumb: {
    borderRadius: radius.full,
    flex: "1",
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 20%, transparent)`,
    position: "relative",
  },
})

export function ScrollArea({
  className,
  children,
  scrollFade = false,
  scrollbarGutter = false,
  fill = false,
  sx,
  ...props
}: ScrollAreaPrimitive.Root.Props & {
  scrollFade?: boolean
  scrollbarGutter?: boolean
  fill?: boolean
  sx?: Sx
}): React.ReactElement {
  const rootProps = stylex.props(styles.root, sx)
  const viewportProps = stylex.props(
    styles.viewport,
    scrollFade && styles.viewportFade,
    scrollbarGutter && styles.viewportGutter,
  )
  const contentProps = stylex.props(fill && styles.contentFill)

  return (
    <ScrollAreaPrimitive.Root
      className={cn(rootProps.className, className)}
      style={rootProps.style}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        className={viewportProps.className}
        data-slot="scroll-area-viewport"
        style={viewportProps.style}
      >
        <ScrollAreaPrimitive.Content
          className={contentProps.className}
          data-slot="scroll-area-content"
          style={contentProps.style}
        >
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar orientation="vertical" />
      <ScrollBar orientation="horizontal" />
      <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" />
    </ScrollAreaPrimitive.Root>
  )
}

export function ScrollBar({
  className,
  orientation = "vertical",
  sx,
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.scrollbar, sx)
  const thumbProps = stylex.props(styles.thumb)

  return (
    <ScrollAreaPrimitive.Scrollbar
      className={cn(styleProps.className, className)}
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      style={styleProps.style}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        className={thumbProps.className}
        data-slot="scroll-area-thumb"
        style={thumbProps.style}
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollAreaPrimitive }

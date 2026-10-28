import type React from "react"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import * as stylex from "@stylexjs/stylex"
import type { Sx } from "../../styles/sx"
import { accordionTriggerMarker } from "../../styles/markers.stylex"
import { colors, motion, radius } from "../../styles/tokens.stylex"
import { cn } from "../../utils/cn"
import { ChevronDown } from "../icons"

const styles = stylex.create({
  item: {
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: {
      default: 1,
      ":last-child": 0,
    },
  },
  header: {
    display: "flex",
  },
  trigger: {
    borderRadius: radius.md,
    gap: "1rem",
    paddingBlock: "1rem",
    alignItems: "flex-start",
    cursor: "pointer",
    display: "flex",
    flexBasis: "0%",
    flexGrow: 1,
    flexShrink: 1,
    fontSize: "0.875rem",
    fontWeight: 500,
    justifyContent: "space-between",
    opacity: {
      default: 1,
      ":disabled": 0.64,
    },
    outlineColor: colors.ring,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 3,
    pointerEvents: {
      default: null,
      ":disabled": "none",
    },
    textAlign: "left",
    transitionProperty: "all",
  },
  indicator: {
    flexShrink: 0,
    opacity: 0.8,
    pointerEvents: "none",
    rotate: {
      default: null,
      [stylex.when.ancestor("[data-panel-open]", accordionTriggerMarker)]: "180deg",
    },
    transitionDuration: {
      "[data-ending-style]": motion.exitLarge,
      default: motion.enterLarge,
    },
    transitionProperty: "rotate",
    transitionTimingFunction: motion.easeOut,
    translate: "0 0.125rem",
    height: "1rem",
    width: "1rem",
  },
  panel: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    transitionDuration: {
      "[data-ending-style]": motion.exitLarge,
      default: motion.enterLarge,
    },
    transitionProperty: "height",
    transitionTimingFunction: motion.easeOut,
    height: {
      "[data-ending-style]": 0,
      "[data-starting-style]": 0,
      default: "var(--accordion-panel-height)",
    },
  },
  panelInner: {
    paddingBottom: "1rem",
    paddingTop: 0,
  },
})

export function Accordion(props: AccordionPrimitive.Root.Props): React.ReactElement {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

export function AccordionItem({
  className,
  sx,
  ...props
}: AccordionPrimitive.Item.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.item, sx)

  return (
    <AccordionPrimitive.Item
      className={cn(styleProps.className, className)}
      data-slot="accordion-item"
      style={styleProps.style}
      {...props}
    />
  )
}

export function AccordionTrigger({
  className,
  children,
  sx,
  ...props
}: AccordionPrimitive.Trigger.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.trigger, accordionTriggerMarker, sx)

  return (
    <AccordionPrimitive.Header {...stylex.props(styles.header)}>
      <AccordionPrimitive.Trigger
        className={cn(styleProps.className, className)}
        data-slot="accordion-trigger"
        style={styleProps.style}
        {...props}
      >
        {children}
        <ChevronDown {...stylex.props(styles.indicator)} data-slot="accordion-indicator" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

export function AccordionPanel({
  className,
  children,
  sx,
  ...props
}: AccordionPrimitive.Panel.Props & {
  sx?: Sx
}): React.ReactElement {
  const innerProps = stylex.props(styles.panelInner, sx)

  return (
    <AccordionPrimitive.Panel
      {...stylex.props(styles.panel)}
      data-slot="accordion-panel"
      {...props}
    >
      <div className={cn(innerProps.className, className)} style={innerProps.style}>
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { AccordionPrimitive, AccordionPanel as AccordionContent }

import { Field as FieldPrimitive } from "@base-ui/react/field"
import { mergeProps } from "@base-ui/react/merge-props"
import * as stylex from "@stylexjs/stylex"
import type * as React from "react"
import { cn } from "@/utils/cn"
import type { Sx } from "../../styles/sx"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"

const styles = stylex.create({
  control: {
    borderColor: {
      default: colors.input,
      ":focus-within": colors.ring,
    },
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.field,
    boxShadow: {
      default: shadows.chip,
      ":focus-within": "none",
    },
    color: colors.foreground,
    display: "inline-flex",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    outlineColor: `color-mix(in srgb, ${colors.ring} 24%, transparent)`,
    outlineOffset: 0,
    outlineStyle: {
      default: "none",
      ":focus-within": "solid",
    },
    outlineWidth: 3,
    position: "relative",
    transitionProperty: "box-shadow, border-color",
    width: "100%",
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: {
        default: shadows.edge,
        ":focus-within": "none",
      },
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  controlDisabled: {
    opacity: 0.64,
  },
  controlInvalid: {
    borderColor: {
      default: `color-mix(in srgb, ${colors.destructive} 36%, transparent)`,
      ":focus-within": `color-mix(in srgb, ${colors.destructive} 64%, transparent)`,
    },
    outlineColor: `color-mix(in srgb, ${colors.destructive} 16%, transparent)`,
  },
  textarea: {
    fieldSizing: "content",
    borderRadius: "inherit",
    paddingBlock: "calc(0.375rem - 1px)",
    paddingInline: "calc(0.75rem - 1px)",
    backgroundColor: "transparent",
    color: "inherit",
    fontSize: "inherit",
    outlineStyle: "none",
    minHeight: {
      default: "5.125rem",
      [consts.sm]: "4.375rem",
    },
    width: "100%",
    "::placeholder": {
      color: `color-mix(in srgb, ${colors.mutedForeground} 72%, transparent)`,
    },
  },
  textareaSm: {
    paddingBlock: "calc(0.25rem - 1px)",
    paddingInline: "calc(0.625rem - 1px)",
    minHeight: {
      default: "4.875rem",
      [consts.sm]: "4.125rem",
    },
  },
  textareaLg: {
    paddingBlock: "calc(0.5rem - 1px)",
    minHeight: {
      default: "5.375rem",
      [consts.sm]: "4.625rem",
    },
  },
})

export type TextareaProps = React.ComponentPropsWithoutRef<"textarea"> &
  React.RefAttributes<HTMLTextAreaElement> & {
    size?: "sm" | "default" | "lg" | number
    unstyled?: boolean
    sx?: Sx
  }

export function Textarea({
  className,
  size = "default",
  unstyled = false,
  ref,
  sx,
  ...props
}: TextareaProps): React.ReactElement {
  const controlProps = stylex.props(
    !unstyled && styles.control,
    !unstyled && props.disabled === true && styles.controlDisabled,
    !unstyled && props["aria-invalid"] !== undefined && styles.controlInvalid,
    sx,
  )
  const textareaProps = stylex.props(
    styles.textarea,
    size === "sm" && styles.textareaSm,
    size === "lg" && styles.textareaLg,
  )

  return (
    <span
      aria-invalid={props["aria-invalid"]}
      className={cn(controlProps.className, className) || undefined}
      data-disabled={props.disabled ? "" : undefined}
      data-size={size}
      data-slot="textarea-control"
      style={controlProps.style}
    >
      <FieldPrimitive.Control
        ref={ref}
        value={props.value}
        defaultValue={props.defaultValue}
        disabled={props.disabled}
        id={props.id}
        name={props.name}
        render={(defaultProps: React.ComponentProps<"textarea">) => (
          <textarea
            className={textareaProps.className}
            data-slot="textarea"
            style={textareaProps.style}
            {...mergeProps(defaultProps, props)}
          />
        )}
      />
    </span>
  )
}

export { FieldPrimitive }

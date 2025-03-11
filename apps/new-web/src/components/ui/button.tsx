"use client"

import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components"
import { type VariantProps, tv } from "tailwind-variants"

const button = tv({
  base: "inline-flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded px-3 py-2 font-medium text-sm transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  variants: {
    color: {
      default: "",
    },
    variant: {
      solid: "",
      outline: "border",
      ghost: "",
    },
  },
  compoundVariants: [
    {
      color: "default",
      variant: "solid",
      className: "bg-primary text-inverted hover:bg-primary-emphasis",
    },
    {
      color: "default",
      variant: "outline",
      className: "bg-default text-subtle hover:border-emphasis hover:bg-muted",
    },
    {
      color: "default",
      variant: "ghost",
      className: "text-subtle transition-colors hover:text-primary",
    },
  ],
  defaultVariants: {
    color: "default",
    variant: "solid",
  },
})

export type ButtonProps = Omit<AriaButtonProps, "className"> &
  VariantProps<typeof button> & {
    className?: string
  }

export const Button = ({
  color,
  variant,
  className,
  ...props
}: ButtonProps) => (
  <AriaButton className={button({ color, variant, className })} {...props} />
)

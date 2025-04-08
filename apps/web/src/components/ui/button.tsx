"use client"

import { LoaderCircleIcon } from "lucide-react"
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components"
import { type VariantProps, tv } from "tailwind-variants"

export const buttonVariants = tv({
  base: [
    "inline-flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded px-3 py-2 font-medium text-sm transition-colors",
    "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-default",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform",
  ],
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

export type ButtonProps = AriaButtonProps &
  VariantProps<typeof buttonVariants> & {
    slot?: string
    className?: string
    children?: React.ReactNode
  }

export const Button = ({
  children,
  color,
  variant,
  className,
  isPending,
  ...props
}: ButtonProps) => (
  <AriaButton
    className={buttonVariants({ color, variant, className })}
    {...props}
  >
    {isPending && <LoaderCircleIcon className="animate-spin" />}
    {children}
  </AriaButton>
)

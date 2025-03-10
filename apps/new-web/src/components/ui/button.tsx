"use client"

import { Button as AriaButton, type ButtonProps } from "react-aria-components"
import { type VariantProps, tv } from "tailwind-variants"

const button = tv({
  base: "inline-flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded px-3 py-2 font-medium text-sm transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  variants: {
    color: {
      default: "",
    },
    variant: {
      outline: "border",
    },
  },
  compoundVariants: [
    {
      color: "default",
      variant: "outline",
      className: "bg-default text-subtle hover:border-emphasis hover:bg-muted",
    },
  ],
  defaultVariants: {
    color: "default",
    variant: "outline",
  },
})

type Props = Omit<ButtonProps, "className"> &
  VariantProps<typeof button> & {
    className?: string
  }

export const Button = ({ className, ...props }: Props) => (
  <AriaButton className={button({ className })} {...props} />
)

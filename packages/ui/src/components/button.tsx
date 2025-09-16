import { Slot } from "@radix-ui/react-slot"
import { LoaderCircleIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { tv, type VariantProps } from "tailwind-variants"

export const buttonVariants = tv({
  base: [
    "inline-flex w-full shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded px-3 py-2 font-medium text-sm transition-[background,scale,border] duration-300 active:scale-[0.98]",
    "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-default",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform",
  ],
  variants: {
    color: {
      default: "",
      secondary: "",
    },
    variant: {
      solid: "",
      outline: "border",
      ghost: "",
    },
    size: {
      default: "h-9",
      icon: "size-9!",
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
    {
      color: "secondary",
      variant: "outline",
      className:
        "bg-secondary text-primary hover:border-emphasis hover:bg-secondary-muted",
    },
  ],
  defaultVariants: {
    color: "default",
    variant: "solid",
  },
})

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    className?: string
    isPending?: boolean
    children?: ReactNode
    asChild?: boolean
  }

export const Button = ({
  color,
  variant,
  size,
  className,
  children,
  isPending = false,
  asChild = false,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={buttonVariants({ color, variant, size, className })}
      {...props}
    >
      {isPending && <LoaderCircleIcon className="animate-spin" />}
      {children}
    </Comp>
  )
}

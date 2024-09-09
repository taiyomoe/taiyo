"use client"

import { type VariantProps, tv } from "@nextui-org/react"
import type {} from "react"
import {
  Button,
  type ButtonProps,
  type PressEvent,
} from "react-aria-components"
import { useToggle } from "usehooks-ts"

const underlineButton = tv({
  base: "relative outline-none transition-all after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:transition-transform after:duration-300 after:ease-in-out hover:cursor-pointer hover:after:origin-bottom-left hover:after:scale-x-100",
  variants: {
    color: {
      default:
        "text-foreground after:bg-gray-200 data-[pressed=true]:text-foreground/70",
      primary:
        "text-primary after:bg-primary data-[pressed=true]:brightness-75",
    },
    type: {
      default: "",
      stay: "data-[selected=true]:after:scale-x-100",
    },
  },
  defaultVariants: {
    color: "default",
    type: "default",
  },
})

type Props = Omit<ButtonProps, "className"> &
  VariantProps<typeof underlineButton> & { className?: string }

export const UnderlineButton = ({
  className,
  onPress,
  color,
  type,
  children,
  ...props
}: Props) => {
  const [isToggled, toggle] = useToggle(false)

  const handlePress = (e: PressEvent) => {
    toggle()
    onPress?.(e)
  }

  return (
    <Button
      className={underlineButton({ color, type, className })}
      onPress={handlePress}
      data-selected={isToggled}
      {...props}
    >
      {children}
    </Button>
  )
}

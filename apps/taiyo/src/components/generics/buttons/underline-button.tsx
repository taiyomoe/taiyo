"use client"

import type { HTMLAttributes, MouseEventHandler } from "react"
import { useToggle } from "usehooks-ts"
import { cn } from "~/lib/utils/cn"

export const UnderlineButton = ({
  className,
  onClick,
  children,
  ...props
}: HTMLAttributes<HTMLButtonElement>) => {
  const [isToggled, toggle] = useToggle(false)

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    toggle()
    onClick?.(e)
  }

  return (
    <button
      className={cn(
        "relative text-default-500 transition-colors duration-400 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-gray-200 after:transition-transform after:duration-300 after:ease-in-out hover:cursor-pointer hover:text-foreground hover:after:origin-bottom-left hover:after:scale-x-100 data-[selected=true]:text-foreground data-[selected=true]:after:scale-x-100",
        className,
      )}
      onClick={handleClick}
      data-selected={isToggled}
      {...props}
    >
      {children}
    </button>
  )
}

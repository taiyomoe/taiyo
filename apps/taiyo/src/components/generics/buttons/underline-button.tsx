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
        "relative text-default-500 transition-colors duration-400 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right hover:after:origin-bottom-left after:scale-x-0 data-[selected=true]:after:scale-x-100 hover:after:scale-x-100 hover:cursor-pointer after:bg-gray-200 data-[selected=true]:text-foreground hover:text-foreground after:transition-transform after:duration-300 after:ease-in-out",
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

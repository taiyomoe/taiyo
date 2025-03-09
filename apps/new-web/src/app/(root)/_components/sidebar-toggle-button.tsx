"use client"

import { type HTMLAttributes, useRef } from "react"
import { ArrowLeftIcon } from "~/components/icons/arrow-left-icon"
import { ArrowRightIcon } from "~/components/icons/arrow-right-icon"
import { cn } from "~/utils/cn"
import { useSidebar } from "./sidebar-context"

type Props = Omit<HTMLAttributes<HTMLDivElement>, "onClick">

export const SidebarToggleButton = ({ className, ...props }: Props) => {
  const { state, toggleSidebar } = useSidebar()
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      className={cn(
        "rounded p-1 text-subtle transition duration-300 hover:cursor-pointer hover:text-default",
        className,
      )}
      onClick={toggleSidebar}
      {...props}
    >
      {state === "expanded" && <ArrowLeftIcon parentRef={ref} />}
      {state === "collapsed" && <ArrowRightIcon parentRef={ref} />}
    </div>
  )
}

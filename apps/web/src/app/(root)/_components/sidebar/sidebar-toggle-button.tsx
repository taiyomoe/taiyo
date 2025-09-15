"use client"

import { cn } from "@taiyomoe/ui/utils/cn"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { useSidebar } from "./sidebar-context"

export const SidebarToggleButton = ({
  className,
  ...props
}: ComponentProps<"button">) => {
  const { state, toggle } = useSidebar()

  return (
    <button
      className={cn(
        "group/sidebar-toggle hidden rounded p-1 text-subtle transition duration-300 hover:cursor-pointer hover:text-default md:block [&_svg]:size-4 [&_svg]:transition-transform",
        className,
      )}
      onClick={toggle}
      type="button"
      {...props}
    >
      {state === "expanded" && (
        <ArrowLeftIcon className="group-hover/sidebar-toggle:-translate-x-1" />
      )}
      {state === "collapsed" && (
        <ArrowRightIcon className="group-hover/sidebar-toggle:translate-x-1" />
      )}
    </button>
  )
}

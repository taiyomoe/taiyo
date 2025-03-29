"use client"

import * as HoverCardPrimitive from "@radix-ui/react-hover-card"
import type { ComponentProps } from "react"
import { cn } from "~/utils/cn"

export const HoverCard = HoverCardPrimitive.Root

export const HoverCardTrigger = HoverCardPrimitive.Trigger

export const HoverCardContent = ({
  className,
  align = "center",
  side = "top",
  sideOffset = 4,
  children,
  ...props
}: ComponentProps<typeof HoverCardPrimitive.Content>) => (
  <HoverCardPrimitive.Content
    align={align}
    side={side}
    sideOffset={sideOffset}
    className={cn(
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-[--radix-hover-card-content-transform-origin] rounded border border-subtle bg-default p-3 text-default shadow-md outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
      className,
    )}
    {...props}
  >
    <HoverCardPrimitive.HoverCardArrow className="fill-subtle" />
    <HoverCardPrimitive.HoverCardArrow className="-mt-[1.5px] fill-default" />
    {children}
  </HoverCardPrimitive.Content>
)
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

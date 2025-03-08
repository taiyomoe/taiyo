"use client"

import { motion } from "motion/react"
import { usePathname } from "next/navigation"
import { type ComponentType, type RefObject, useRef } from "react"
import { Link } from "react-aria-components"
import { type VariantProps, tv } from "tailwind-variants"
import { useHover } from "usehooks-ts"
import type { AnimatedIconProps } from "~/components/icons/home-icon"

const sidebarButton = tv({
  base: "relative flex select-none items-center gap-2 rounded p-2 transition",
  slots: {
    activeBubble:
      "-left-4 absolute inset-y-0 z-10 my-auto h-2/3 w-1 rounded-r-lg bg-brand",
    hoverBubble:
      "-left-4 absolute inset-y-0 z-0 my-auto hidden h-2/3 w-1 rounded-r-lg md:block",
  },
  variants: {
    color: {
      default: {
        base: "text-subtle hover:bg-subtle hover:text-default data-[active=true]:text-default",
        hoverBubble: "bg-subtle",
      },
      warning: {
        base: "text-warning-subtle hover:bg-warning-subtle hover:text-warning data-[active=true]:text-warning",
        hoverBubble: "bg-warning-subtle",
      },
    },
  },
  defaultVariants: {
    color: "default",
  },
})

type Props = {
  href: string
  label: string
  icon: ComponentType<AnimatedIconProps>
} & VariantProps<typeof sidebarButton>

export const SidebarButton = ({ href, label, icon: Icon, color }: Props) => {
  const pathname = usePathname()
  const isActive = pathname === href
  const ref = useRef<HTMLAnchorElement>(null)
  const isHover = useHover(ref as RefObject<HTMLAnchorElement>)
  const slots = sidebarButton({ color })

  return (
    <Link ref={ref} href={href} className={slots.base()} data-active={isActive}>
      {isActive && (
        <motion.span
          layoutId="bubble-active"
          className={slots.activeBubble()}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      {isHover && (
        <motion.span
          layoutId="bubble-hover"
          className={slots.hoverBubble()}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <Icon parentRef={ref} />
      {label}
    </Link>
  )
}

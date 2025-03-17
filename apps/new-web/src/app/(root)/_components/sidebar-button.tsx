"use client"

import { motion } from "motion/react"
import { usePathname } from "next/navigation"
import { type ComponentType, type RefObject, useRef } from "react"
import { Link } from "react-aria-components"
import { type VariantProps, tv } from "tailwind-variants"
import { useHover } from "usehooks-ts"
import type { AnimatedIconProps } from "~/components/icons/home-icon"

const sidebarButton = tv({
  base: 'group/sidebar-button relative block select-none py-1.5 first:pt-0 last:pb-0 first:[&_[id^="bubble-"]]:mt-[8] last:[&_[id^="bubble-"]]:mb-[8] group-data-[state=collapsed]:last:[&_[id^="bubble-"]]:mb-[4] group-data-[state=collapsed]:first:[&_[id^="bubble-"]]:mt-[4]',
  slots: {
    activeBubble:
      "-left-2 group-data-[state=expanded]:-left-4 absolute inset-y-0 z-10 my-auto h-5 w-1 rounded-r-lg bg-brand group-data-[state=expanded]:h-6",
    hoverBubble:
      "-left-2 group-data-[state=expanded]:-left-4 absolute inset-y-0 z-0 my-auto hidden h-5 w-1 rounded-r-lg group-data-[state=expanded]:h-6 md:block",
    content:
      "flex items-center gap-2 rounded p-1 transition-[color,background,margin,padding] duration-300 group-data-[state=collapsed]:ml-[1.5px] group-data-[state=expanded]:p-2",
    label: "group-data-[state=collapsed]:hidden",
  },
  variants: {
    color: {
      default: {
        hoverBubble: "bg-subtle",
        content:
          "text-subtle group-hover/sidebar-button:bg-subtle group-hover/sidebar-button:text-default data-[active=true]:text-default",
      },
      warning: {
        hoverBubble: "bg-warning-subtle",
        content:
          "text-warning-subtle group-hover/sidebar-button:bg-warning-subtle group-hover/sidebar-button:text-warning data-[active=true]:text-warning",
      },
    },
    active: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      color: "default",
      active: true,
      className: {
        content: "text-default",
      },
    },
    {
      color: "warning",
      active: true,
      className: {
        content: "text-warning",
      },
    },
  ],
  defaultVariants: {
    color: "default",
    active: false,
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
  const slots = sidebarButton({ color, active: isActive })

  return (
    <Link ref={ref} href={href} className={slots.base()} data-active={isActive}>
      {isActive && (
        <motion.span
          id="bubble-active"
          layoutId="bubble-active"
          className={slots.activeBubble()}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      {isHover && (
        <motion.span
          id="bubble-hover"
          layoutId="bubble-hover"
          className={slots.hoverBubble()}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className={slots.content()}>
        <Icon parentRef={ref} />
        <span className={slots.label()}>{label}</span>
      </span>
    </Link>
  )
}

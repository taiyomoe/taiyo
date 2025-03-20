"use client"

import type { Variants } from "motion/react"
import { motion, useAnimation } from "motion/react"
import type { RefObject } from "react"
import { useEffect } from "react"
import { useHover } from "usehooks-ts"
import type { AnimatedIconProps } from "~/components/icons/home-icon"
import { cn } from "~/utils/cn"

const variants: Variants = {
  normal: {
    pathLength: 1,
    opacity: 1,
  },
  animate: (custom: number) => ({
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      duration: 0.3,
      delay: custom * 0.1,
    },
  }),
}

export const IdCardIcon = ({
  size = 20,
  className,
  parentRef,
  ...props
}: AnimatedIconProps) => {
  const isHovered = useHover(parentRef as RefObject<HTMLElement>)
  const controls = useAnimation()

  useEffect(() => {
    if (isHovered) {
      controls.start("animate")

      return
    }

    controls.start("normal")
  }, [isHovered, controls])

  return (
    <div className={cn("select-none", className)} {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <title>Id Card</title>
        <motion.path
          d="M16 10h2"
          variants={variants}
          animate={controls}
          custom={2}
        />
        <motion.path
          d="M16 14h2"
          variants={variants}
          animate={controls}
          custom={2}
        />
        <motion.path
          d="M6.17 15a3 3 0 0 1 5.66 0"
          variants={variants}
          animate={controls}
          custom={0}
        />
        <motion.circle
          cx="9"
          cy="11"
          r="2"
          variants={variants}
          animate={controls}
          custom={1}
        />
        <rect x="2" y="5" width="20" height="14" rx="2" />
      </svg>
    </div>
  )
}

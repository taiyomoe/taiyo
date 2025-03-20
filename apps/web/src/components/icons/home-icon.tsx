"use client"

import {
  type Transition,
  type Variants,
  motion,
  useAnimation,
} from "motion/react"
import { type HTMLAttributes, type RefObject, useEffect } from "react"
import { useHover } from "usehooks-ts"
import { cn } from "~/utils/cn"

export type AnimatedIconProps = HTMLAttributes<HTMLDivElement> & {
  size?: number
  parentRef: RefObject<HTMLElement | null>
}

const defaultTransition: Transition = {
  duration: 0.6,
  opacity: { duration: 0.2 },
  colors: { duration: 0.15 },
}

const pathVariants: Variants = {
  normal: { pathLength: 1, opacity: 1 },
  animate: { opacity: [0, 1], pathLength: [0, 1] },
}

export const HomeIcon = ({
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
        <title>Home</title>
        <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <motion.path
          d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"
          variants={pathVariants}
          transition={defaultTransition}
          animate={controls}
        />
      </svg>
    </div>
  )
}

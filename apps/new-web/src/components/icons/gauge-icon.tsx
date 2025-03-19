"use client"

import type { Transition } from "motion/react"
import { motion, useAnimation } from "motion/react"
import { type RefObject, useEffect } from "react"
import { useHover } from "usehooks-ts"
import { cn } from "~/utils/cn"
import type { AnimatedIconProps } from "./home-icon"

const defaultTransition: Transition = {
  type: "spring",
  stiffness: 160,
  damping: 17,
  mass: 1,
}

export const GaugeIcon = ({
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
        <title>Gauge</title>
        <motion.path
          d="m12 14 4-4"
          variants={{
            animate: { translateX: 0.5, translateY: 3, rotate: 72 },
            normal: {
              translateX: 0,
              rotate: 0,
              translateY: 0,
            },
          }}
          animate={controls}
          transition={defaultTransition}
        />
        <path d="M3.34 19a10 10 0 1 1 17.32 0" />
      </svg>
    </div>
  )
}

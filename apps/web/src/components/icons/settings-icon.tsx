"use client"

import type { Transition } from "motion/react"
import { motion, useAnimation } from "motion/react"
import type { RefObject } from "react"
import { useEffect } from "react"
import { useHover } from "usehooks-ts"
import type { AnimatedIconProps } from "~/components/icons/home-icon"
import { cn } from "~/utils/cn"

const defaultTransition: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 12,
  mass: 0.4,
}

export const SettingsIcon = ({
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
        <title>Settings</title>
        <motion.line
          x1="21"
          x2="14"
          y1="4"
          y2="4"
          initial={false}
          variants={{
            normal: {
              x2: 14,
            },
            animate: {
              x2: 10,
            },
          }}
          animate={controls}
          transition={defaultTransition}
        />
        <motion.line
          x1="10"
          x2="3"
          y1="4"
          y2="4"
          variants={{
            normal: {
              x1: 10,
            },
            animate: {
              x1: 5,
            },
          }}
          animate={controls}
          transition={defaultTransition}
        />

        <motion.line
          x1="21"
          x2="12"
          y1="12"
          y2="12"
          variants={{
            normal: {
              x2: 12,
            },
            animate: {
              x2: 18,
            },
          }}
          animate={controls}
          transition={defaultTransition}
        />

        <motion.line
          x1="8"
          x2="3"
          y1="12"
          y2="12"
          variants={{
            normal: {
              x1: 8,
            },
            animate: {
              x1: 13,
            },
          }}
          animate={controls}
          transition={defaultTransition}
        />

        <motion.line
          x1="3"
          x2="12"
          y1="20"
          y2="20"
          variants={{
            normal: {
              x2: 12,
            },
            animate: {
              x2: 4,
            },
          }}
          animate={controls}
          transition={defaultTransition}
        />

        <motion.line
          x1="16"
          x2="21"
          y1="20"
          y2="20"
          variants={{
            normal: {
              x1: 16,
            },
            animate: {
              x1: 8,
            },
          }}
          animate={controls}
          transition={defaultTransition}
        />

        <motion.line
          x1="14"
          x2="14"
          y1="2"
          y2="6"
          variants={{
            normal: {
              x1: 14,
              x2: 14,
            },
            animate: {
              x1: 9,
              x2: 9,
            },
          }}
          animate={controls}
          transition={defaultTransition}
        />

        <motion.line
          x1="8"
          x2="8"
          y1="10"
          y2="14"
          variants={{
            normal: {
              x1: 8,
              x2: 8,
            },
            animate: {
              x1: 14,
              x2: 14,
            },
          }}
          animate={controls}
          transition={defaultTransition}
        />

        <motion.line
          x1="16"
          x2="16"
          y1="18"
          y2="22"
          variants={{
            normal: {
              x1: 16,
              x2: 16,
            },
            animate: {
              x1: 8,
              x2: 8,
            },
          }}
          animate={controls}
          transition={defaultTransition}
        />
      </svg>
    </div>
  )
}

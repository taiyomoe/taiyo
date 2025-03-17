"use client"

import type { Variants } from "motion/react"
import { motion, useAnimation } from "motion/react"
import type { RefObject } from "react"
import { useEffect } from "react"
import { useHover } from "usehooks-ts"
import type { AnimatedIconProps } from "~/components/icons/home-icon"
import { cn } from "~/utils/cn"

const pathVariants: Variants = {
  normal: { opacity: 1 },
  animate: (i: number) => ({
    opacity: [0, 1],
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
}

export const SunIcon = ({
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
        <title>Sun</title>
        <circle cx="12" cy="12" r="4" />
        {[
          "M12 2v2",
          "m19.07 4.93-1.41 1.41",
          "M20 12h2",
          "m17.66 17.66 1.41 1.41",
          "M12 20v2",
          "m6.34 17.66-1.41 1.41",
          "M2 12h2",
          "m4.93 4.93 1.41 1.41",
        ].map((d, index) => (
          <motion.path
            key={d}
            d={d}
            animate={controls}
            variants={pathVariants}
            custom={index + 1}
          />
        ))}
      </svg>
    </div>
  )
}

"use client"

import { motion, useScroll, useTransform } from "framer-motion"

export const NavbarBorder = () => {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 200], [0, 1])

  return (
    <motion.span
      className="absolute bottom-0 left-0 h-[1px] w-full bg-primary transition-all group-hover:top-0"
      style={{ opacity }}
    />
  )
}

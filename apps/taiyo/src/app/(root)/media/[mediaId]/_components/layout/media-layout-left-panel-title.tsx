"use client"

import type { MediaLimited } from "@taiyomoe/types"
import { motion, useScroll, useTransform } from "framer-motion"
import { useCallback } from "react"

type Props = { media: MediaLimited }

export const MediaLayoutLeftPanelTitle = ({ media }: Props) => {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [250, 400], [0, 1])

  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <motion.h2
      className="line-clamp-2 hidden text-center font-semibold text-2xl transition-all hover:cursor-pointer hover:underline md:block"
      style={{ opacity }}
      onClick={handleClick}
    >
      {media.mainTitle}
    </motion.h2>
  )
}

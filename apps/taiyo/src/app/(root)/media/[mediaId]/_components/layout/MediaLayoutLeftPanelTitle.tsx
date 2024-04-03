"use client"

import type { MediaLimited } from "@taiyomoe/types"
import { useCallback } from "react"
import { useScrollOpacity } from "~/hooks/useScrollOpacity"

type Props = { media: MediaLimited }

export const MediaLayoutLeftPanelTitle = ({ media }: Props) => {
  const { opacity } = useScrollOpacity({ min: 300, max: 450 })

  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <h2
      className="line-clamp-2 hidden text-center font-semibold text-2xl transition-all md:block hover:cursor-pointer hover:underline"
      style={{ opacity }}
      onClick={handleClick}
    >
      {media.mainTitle}
    </h2>
  )
}

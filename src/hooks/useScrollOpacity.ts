"use client"

import { useEffect, useState } from "react"

type Props = {
  min: number
  max: number
}

export const useScrollOpacity = ({ min, max }: Props) => {
  const computeOpacity = () => {
    if (typeof window === "undefined") return 0

    const currentScrollPos = window.scrollY

    if (currentScrollPos < min) {
      return 0
    } else if (currentScrollPos < max) {
      return (currentScrollPos - min) / (max - min)
    } else {
      return 1
    }
  }

  const [opacity, setOpacity] = useState(computeOpacity())

  const handleScroll = () => {
    setOpacity(computeOpacity())
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)
  })

  if (typeof window === "undefined") return { opacity: 0 }

  return { opacity }
}

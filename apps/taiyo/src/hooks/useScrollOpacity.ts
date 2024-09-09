"use client"

import { useEffect, useState } from "react"
import { useIsMounted } from "usehooks-ts"

type Props = {
  min: number
  max: number
}

export const useScrollOpacity = ({ min, max }: Props) => {
  const isMounted = useIsMounted()

  const computeOpacity = () => {
    if (typeof window === "undefined") return 0

    const currentScrollPos = window.scrollY

    if (currentScrollPos < min) {
      return 0
    }

    if (currentScrollPos < max) {
      return (currentScrollPos - min) / (max - min)
    }

    return 1
  }

  const [opacity, setOpacity] = useState(computeOpacity())

  const handleScroll = () => {
    setOpacity(computeOpacity())
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)
  })

  return isMounted() ? opacity : 1
}

"use client"

import { useEffect } from "react"
import { useDevice } from "~/hooks/useDevice"

export const useBodyPadding = () => {
  const device = useDevice()

  useEffect(() => {
    const root = document.documentElement

    if (device?.isLaptop || device?.isDesktop) {
      root.style.setProperty("--body-padding", "32px")
      return
    }

    if (device?.isWideScreen) {
      root.style.setProperty("--body-padding", "48px")
      return
    }

    root.style.removeProperty("--body-padding")
  })
}

"use client"

import { useLayoutEffect, useState } from "react"
import { Snowfall } from "react-snowfall"

export const SnowflakesProvider = () => {
  const [images, setImages] = useState<HTMLImageElement[]>()

  useLayoutEffect(() => {
    const snowflakeImg = document.createElement("img")
    snowflakeImg.src = "/snowflake.png"

    setImages([snowflakeImg])
  }, [])

  return (
    <Snowfall
      style={{
        position: "fixed",
        width: "100vw",
        height: "100vh",
        zIndex: 100,
      }}
      radius={[10, 18]}
      wind={[-0.5, 1]}
      speed={[0.5, 1]}
      opacity={[0.1, 0.2]}
      images={images}
    />
  )
}

"use client"
import Particles, {
  initParticlesEngine,
  type IParticlesProps,
} from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import { useEffect, useId, useState } from "react"

type Props = {
  className?: string
  size?: number
  minSize?: number | null
  density?: number
  speed?: number
  minSpeed?: number | null
  opacity?: number
  opacitySpeed?: number
  minOpacity?: number | null
  color?: string
}

export const Sparkles = ({
  className,
  size = 1.2,
  minSize = null,
  density = 100,
  speed = 1,
  minSpeed = null,
  opacity = 1,
  opacitySpeed = 3,
  minOpacity = null,
  color = "#ffffff",
}: Props) => {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setIsReady(true)
    })
  }, [])

  const id = useId()
  const defaultOptions = {
    fullScreen: {
      enable: false,
      zIndex: 1,
    },
    fpsLimit: 60,

    interactivity: {
      modes: {
        push: {
          quantity: 4,
        },
        repulse: {
          distance: 200,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: { value: color },
      move: {
        enable: true,
        speed: {
          min: minSpeed || speed / 130,
          max: speed,
        },
        straight: true,
      },
      collisions: {
        absorb: { speed: 2 },
        bounce: {
          horizontal: { value: 1 },
          vertical: { value: 1 },
        },
        enable: false,
        maxSpeed: 50,
        mode: "bounce",
        overlap: {
          enable: true,
          retries: 0,
        },
      },
      number: { value: density },
      opacity: {
        value: {
          min: minOpacity || opacity / 10,
          max: opacity,
        },
        animation: {
          enable: true,
          sync: false,
          speed: opacitySpeed,
        },
      },
      size: {
        value: {
          min: minSize || size / 1.5,
          max: size,
        },
      },
    },
    detectRetina: true,
  } satisfies IParticlesProps["options"]

  if (!isReady) return null

  return <Particles id={id} options={defaultOptions} className={className} />
}

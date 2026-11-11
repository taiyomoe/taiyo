import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { type CSSProperties, type RefObject, useEffect, useRef, useState } from "react"
import type { SunScene } from "@/components/scene/sun/sun-scene"
import { scene } from "@/components/scene/scene.stylex"

const styles = stylex.create({
  canvas: {
    inset: 0,
    display: "block",
    opacity: 0,
    pointerEvents: "none",
    position: "absolute",
    transitionDuration: "600ms",
    transitionProperty: "opacity",
    height: "100%",
    width: "100%",
  },
  disc: {
    inset: 0,
    borderRadius: "50%",
    backgroundImage: `radial-gradient(circle at 50% 40%, ${scene.goldPale} 0%, #ffd060 26%, ${scene.gold} 46%, ${scene.brand} 70%, #c8301c 100%)`,
    boxShadow: `0 0 140px 40px color-mix(in srgb, #ff8c28 55%, transparent), 0 0 280px 110px color-mix(in srgb, ${scene.gold} 30%, transparent)`,
    position: "absolute",
    transitionDuration: "600ms",
    transitionProperty: "opacity",
  },
  shown: {
    opacity: 1,
  },
  hidden: {
    opacity: 0,
  },
})

/**
 * The 3D plasma sun with its beams. `orbit` places the sun in CSS; until the
 * WebGL scene has drawn its first frame (or if WebGL is missing), a flat disc
 * stands in at that spot. Dragging the sun anywhere on `surface` spins it.
 */
export const PlasmaSun = ({
  surfaceRef,
  orbit,
  orbitStyle,
}: {
  surfaceRef: RefObject<HTMLElement | null>
  orbit: Sx
  orbitStyle?: CSSProperties
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let disposed = false
    let instance: SunScene | null = null

    void import("@/components/scene/sun/sun-scene")
      .then(({ createSunScene }) => {
        const canvas = canvasRef.current
        const anchor = anchorRef.current
        const surface = surfaceRef.current

        if (disposed || canvas === null || anchor === null || surface === null) {
          return
        }

        instance = createSunScene({
          canvas,
          anchor,
          surface,
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          onReady: () => {
            setReady(true)
          },
        })
      })
      .catch(() => {
        setReady(false)
      })

    return () => {
      disposed = true
      instance?.dispose()
    }
  }, [surfaceRef])

  return (
    <>
      <canvas ref={canvasRef} aria-hidden sx={[styles.canvas, ready && styles.shown]} />
      <div ref={anchorRef} sx={orbit} style={orbitStyle}>
        <div sx={[styles.disc, ready && styles.hidden]} />
      </div>
    </>
  )
}

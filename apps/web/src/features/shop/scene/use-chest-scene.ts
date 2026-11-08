import type { LootBoxKey } from "@taiyomoe/db/loot-boxes"
import { useEffect, useRef, useState } from "react"
import type { ChestScene, ChestSceneMode } from "@/features/shop/scene/chest-scene"

export function useChestScene({ tier, mode }: { tier: LootBoxKey; mode: ChestSceneMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tierRef = useRef(tier)
  const [scene, setScene] = useState<ChestScene | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    tierRef.current = tier
    scene?.setTier(tier)
  }, [scene, tier])

  useEffect(() => {
    let disposed = false
    let instance: ChestScene | null = null

    void import("@/features/shop/scene/chest-scene")
      .then(({ createChestScene }) => {
        const canvas = canvasRef.current

        if (disposed || canvas === null) {
          return
        }

        instance = createChestScene({
          canvas,
          tier: tierRef.current,
          mode,
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        })
        setScene(instance)
      })
      .catch(() => {
        setFailed(true)
      })

    return () => {
      disposed = true
      instance?.dispose()
    }
  }, [mode])

  return { canvasRef, scene, failed }
}

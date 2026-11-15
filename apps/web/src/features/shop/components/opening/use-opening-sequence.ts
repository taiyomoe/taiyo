import type { LootBoxKey } from "@taiyomoe/db/loot-boxes"
import { useEffect, useRef, useState } from "react"
import type { ChestScene } from "@/features/shop/scene/chest-scene"
import { type LootBoxOpening, useOpenLootBox } from "@/features/shop/api/shop"
import { type ChestAudio, createChestAudio } from "@/features/shop/lib/chest-audio"

export type OpeningStage = "idle" | "charging" | "burst" | "reveal" | "done" | "failed"

const CHARGE_MS = 2200
const BURST_TO_REVEAL_MS = 850
const REVEAL_TO_DONE_MS = 1100

export function useOpeningSequence({ scene, sound }: { scene: ChestScene | null; sound: boolean }) {
  const open = useOpenLootBox()
  const [stage, setStage] = useState<OpeningStage>("idle")
  const [result, setResult] = useState<LootBoxOpening | null>(null)
  const audioRef = useRef<ChestAudio | null>(null)
  const timersRef = useRef<number[]>([])
  const soundRef = useRef(sound)

  useEffect(() => {
    soundRef.current = sound
  }, [sound])

  const audio = () => {
    if (!soundRef.current) {
      return null
    }

    audioRef.current ??= createChestAudio()

    return audioRef.current
  }
  const clearTimers = () => {
    for (const timer of timersRef.current) {
      window.clearTimeout(timer)
      window.clearInterval(timer)
    }

    timersRef.current = []
  }
  const later = (ms: number, run: () => void) => {
    timersRef.current.push(window.setTimeout(run, ms))
  }

  useEffect(
    () => () => {
      clearTimers()
      audioRef.current?.close()
    },
    [],
  )

  const start = (box: LootBoxKey) => {
    if (scene === null) {
      return
    }

    clearTimers()
    scene.reset()
    setResult(null)
    setStage("charging")

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const chargeMs = reduced ? 400 : CHARGE_MS
    const startedAt = performance.now()
    let beat = 0

    void audio()?.resume()
    audio()?.charge(chargeMs / 1000)

    const ramp = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - startedAt) / chargeMs)

      scene.setCharge(progress)
      beat += 1

      if (beat % 3 === 0) {
        audio()?.rattle(progress)
      }
    }, 50)

    timersRef.current.push(ramp)

    open.mutate(box, {
      onSuccess: (opening) => {
        later(Math.max(0, chargeMs - (performance.now() - startedAt)), () => {
          window.clearInterval(ramp)
          setResult(opening)
          setStage("burst")
          scene.burst(opening.item.rarity)
          audio()?.burst(opening.item.rarity)
          later(BURST_TO_REVEAL_MS, () => {
            setStage("reveal")
            audio()?.reveal(opening.item.rarity)
            later(REVEAL_TO_DONE_MS, () => {
              setStage("done")
            })
          })
        })
      },
      onError: () => {
        window.clearInterval(ramp)
        scene.reset()
        audio()?.fail()
        setStage("failed")
      },
    })
  }

  return { stage, result, error: open.error, start }
}

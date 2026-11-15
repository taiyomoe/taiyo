import type { LootBoxKey } from "@taiyomoe/db/loot-boxes"
import type { Ref } from "react"
import * as stylex from "@stylexjs/stylex"
import { CHEST_PALETTES } from "@/features/shop/scene/chest-palettes"

const styles = stylex.create({
  canvas: {
    inset: 0,
    display: "block",
    position: "absolute",
    height: "100%",
    width: "100%",
  },
  fallback: (glow: string) => ({
    inset: 0,
    backgroundImage: `radial-gradient(40% 45% at 50% 55%, color-mix(in srgb, ${glow} 35%, transparent), transparent 70%)`,
    position: "absolute",
  }),
})

export function StageCanvas({
  canvasRef,
  failed,
  tier,
}: {
  canvasRef: Ref<HTMLCanvasElement>
  failed: boolean
  tier: LootBoxKey
}) {
  if (failed) {
    return <div aria-hidden sx={styles.fallback(CHEST_PALETTES[tier].glow)} />
  }

  return <canvas ref={canvasRef} aria-hidden sx={styles.canvas} />
}

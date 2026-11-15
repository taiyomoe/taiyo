import type { LootBoxKey } from "@taiyomoe/db/loot-boxes"
import * as stylex from "@stylexjs/stylex"
import { breakpoints, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import type { Shop } from "@/features/shop/api/shop"
import type { ShopViewer } from "@/features/shop/components/items/item-preview"
import { OpeningOverlay } from "@/features/shop/components/opening/opening-overlay"
import { LootBoxOdds } from "@/features/shop/components/treasury/loot-box-odds"
import { StageCanvas } from "@/features/shop/components/treasury/stage-canvas"
import { TierInfo } from "@/features/shop/components/treasury/tier-info"
import { TierPicker } from "@/features/shop/components/treasury/tier-picker"
import { useChestScene } from "@/features/shop/scene/use-chest-scene"

const styles = stylex.create({
  stage: {
    borderColor: "rgb(255 255 255 / 7%)",
    borderRadius: radius.xxxl,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "#060609",
    boxShadow: "0 40px 120px -40px rgb(0 0 0 / 90%)",
    isolation: "isolate",
    position: "relative",
    minHeight: { default: "40rem", [breakpoints.md]: "36rem" },
  },
  viewport: {
    inset: 0,
    position: "absolute",
    bottom: { default: "50%", [breakpoints.md]: 0 },
  },
  scrim: {
    inset: 0,
    backgroundImage: {
      default: "linear-gradient(180deg, transparent 30%, #060609 52%)",
      [breakpoints.md]:
        "linear-gradient(90deg, rgb(6 6 9 / 92%) 0%, rgb(6 6 9 / 30%) 30%, transparent 42%, transparent 62%, rgb(6 6 9 / 30%) 72%, rgb(6 6 9 / 88%) 100%)",
    },
    pointerEvents: "none",
    position: "absolute",
  },
  overlay: {
    padding: { default: "1.5rem", [breakpoints.lg]: "2.5rem" },
    gap: "1.5rem",
    gridTemplateAreas: {
      default: '"space" "info" "odds" "picker"',
      [breakpoints.md]: '"info space odds" "picker picker picker"',
    },
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.md]: "minmax(0, 19rem) minmax(0, 1fr) minmax(0, 17rem)",
    },
    gridTemplateRows: {
      default: "16rem auto auto auto",
      [breakpoints.md]: "minmax(0, 1fr) auto",
    },
    pointerEvents: "none",
    position: "relative",
    minHeight: { default: "40rem", [breakpoints.md]: "36rem" },
  },
  info: {
    alignSelf: "center",
    gridColumnEnd: "info",
    gridColumnStart: "info",
    gridRowEnd: "info",
    gridRowStart: "info",
    pointerEvents: "auto",
  },
  odds: {
    alignSelf: "center",
    gridColumnEnd: "odds",
    gridColumnStart: "odds",
    gridRowEnd: "odds",
    gridRowStart: "odds",
    pointerEvents: "auto",
  },
  picker: {
    display: "flex",
    gridColumnEnd: "picker",
    gridColumnStart: "picker",
    gridRowEnd: "picker",
    gridRowStart: "picker",
    justifyContent: "center",
    pointerEvents: "auto",
  },
})

export function Treasury({
  shop,
  viewer,
  username,
}: {
  shop: Shop
  viewer: ShopViewer
  username: string
}) {
  const [selected, setSelected] = useState<LootBoxKey>("gold")
  const [opening, setOpening] = useState(false)
  const { canvasRef, failed } = useChestScene({ tier: selected, mode: "showcase" })
  const index = Math.max(
    0,
    shop.lootBoxes.findIndex((box) => box.key === selected),
  )
  const box = shop.lootBoxes[index]

  if (box === undefined) {
    return null
  }

  return (
    <section sx={styles.stage}>
      <div sx={styles.viewport}>
        <StageCanvas canvasRef={canvasRef} failed={failed} tier={selected} />
      </div>
      <div aria-hidden sx={styles.scrim} />
      <div sx={styles.overlay}>
        <div sx={styles.info}>
          <TierInfo
            balance={shop.balance}
            box={box}
            index={index}
            onOpen={() => {
              setOpening(true)
            }}
            total={shop.lootBoxes.length}
          />
        </div>
        <div sx={styles.odds}>
          <LootBoxOdds box={box} />
        </div>
        <div sx={styles.picker}>
          <TierPicker boxes={shop.lootBoxes} onSelect={setSelected} selected={selected} />
        </div>
      </div>
      {opening ? (
        <OpeningOverlay
          box={box}
          onClose={() => {
            setOpening(false)
          }}
          username={username}
          viewer={viewer}
        />
      ) : null}
    </section>
  )
}

import * as stylex from "@stylexjs/stylex"
import { Close } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { DialogPrimitive } from "@taiyomoe/ui/components/ui/dialog"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { breakpoints, font, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { useEffect, useRef } from "react"
import type { ShopLootBox } from "@/features/shop/api/shop"
import type { ShopViewer } from "@/features/shop/components/items/item-preview"
import { RevealCard } from "@/features/shop/components/opening/reveal-card"
import { useOpeningSequence } from "@/features/shop/components/opening/use-opening-sequence"
import { SoundToggle } from "@/features/shop/components/sound-toggle"
import { StageCanvas } from "@/features/shop/components/treasury/stage-canvas"
import { toEquipPatch } from "@/features/shop/lib/equip-patch"
import { SHOP_ERROR_MESSAGES } from "@/features/shop/lib/shop-errors"
import { TIER_LABELS } from "@/features/shop/lib/tier-labels"
import { useSoundPreference } from "@/features/shop/lib/use-sound-preference"
import { useChestScene } from "@/features/shop/scene/use-chest-scene"
import { useEquipCosmetics } from "@/features/users/api/profile"
import { getCosmeticLabel } from "@/features/users/lib/cosmetic-labels"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const fadeUp = stylex.keyframes({
  "0%": { opacity: 0, transform: "translateY(12px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
})
const styles = stylex.create({
  backdrop: {
    inset: 0,
    backgroundColor: "#040406",
    opacity: { default: 1, ":is([data-ending-style])": 0, ":is([data-starting-style])": 0 },
    position: "fixed",
    transitionDuration: "320ms",
    transitionProperty: "opacity",
    zIndex: 60,
  },
  popup: {
    inset: 0,
    color: "white",
    display: "flex",
    flexDirection: "column",
    opacity: { default: 1, ":is([data-ending-style])": 0, ":is([data-starting-style])": 0 },
    outlineStyle: "none",
    position: "fixed",
    transitionDuration: "420ms",
    transitionProperty: "opacity",
    zIndex: 61,
  },
  bar: {
    padding: { default: "1rem 1.25rem", [breakpoints.md]: "1.5rem 2rem" },
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    position: "relative",
  },
  heading: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: font.weightBold,
  },
  status: {
    margin: 0,
    color: "rgb(255 255 255 / 55%)",
    fontSize: "0.8125rem",
  },
  tools: {
    gap: "0.25rem",
    alignItems: "center",
    display: "flex",
  },
  ghost: {
    color: { default: "rgb(255 255 255 / 70%)", ":hover": "white" },
  },
  reveal: {
    paddingInline: "1.25rem",
    alignItems: "flex-start",
    display: "flex",
    flexGrow: 1,
    justifyContent: "center",
    pointerEvents: "none",
    position: "relative",
    paddingTop: "4vh",
  },
  footer: {
    padding: "1.5rem",
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    minHeight: "7rem",
  },
  actions: {
    gap: "0.75rem",
    animationDuration: "420ms",
    animationFillMode: "both",
    animationName: fadeUp,
    animationTimingFunction: motion.easeOut,
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  balance: {
    color: "rgb(255 255 255 / 50%)",
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
  },
  error: {
    color: "#fca5a5",
    fontSize: "0.875rem",
  },
})

export function OpeningOverlay({
  box,
  viewer,
  username,
  onClose,
}: {
  box: ShopLootBox
  viewer: ShopViewer
  username: string
  onClose: () => void
}) {
  const sound = useSoundPreference()
  const { canvasRef, scene, failed } = useChestScene({ tier: box.key, mode: "opening" })
  const sequence = useOpeningSequence({ scene, sound: sound.enabled })
  const equip = useEquipCosmetics(username)
  const started = useRef(false)
  const { result, stage } = sequence
  const busy = stage === "charging" || stage === "burst"
  const label = TIER_LABELS[box.key].name()

  useEffect(() => {
    if (scene !== null && !started.current) {
      started.current = true
      sequence.start(box.key)
    }
  })

  return (
    <DialogPrimitive.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open && !busy) {
          onClose()
        }
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop {...stylex.props(styles.backdrop)} />
        <DialogPrimitive.Popup {...stylex.props(styles.popup)}>
          <StageCanvas canvasRef={canvasRef} failed={failed} tier={box.key} />
          <header sx={styles.bar}>
            <div sx={styles.heading}>
              <DialogPrimitive.Title {...stylex.props(styles.title)}>
                {m.shop_opening_title({ box: label })}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description {...stylex.props(styles.status)}>
                {stage === "charging"
                  ? m.shop_opening_charging()
                  : m.shop_box_duplicate_refund({
                      refund: box.duplicateRefund.toLocaleString(getLocale()),
                    })}
              </DialogPrimitive.Description>
            </div>
            <div sx={styles.tools}>
              <SoundToggle enabled={sound.enabled} onToggle={sound.toggle} />
              <Button
                aria-label={m.shop_opening_done()}
                disabled={busy}
                onClick={onClose}
                size="icon-sm"
                sx={styles.ghost}
                variant="ghost"
              >
                <Close size={18} />
              </Button>
            </div>
          </header>
          <div sx={styles.reveal}>
            {result !== null && (stage === "reveal" || stage === "done") ? (
              <RevealCard opening={result} viewer={viewer} />
            ) : null}
          </div>
          <footer sx={styles.footer}>
            {stage === "failed" ? (
              <span role="alert" sx={styles.error}>
                {getErrorMessage(sequence.error, SHOP_ERROR_MESSAGES)}
              </span>
            ) : null}
            {equip.isError ? (
              <span role="alert" sx={styles.error}>
                {getErrorMessage(equip.error)}
              </span>
            ) : null}
            {result !== null && stage === "done" ? (
              <>
                <div sx={styles.actions}>
                  <Button onClick={onClose} sx={styles.ghost} variant="ghost">
                    {m.shop_opening_done()}
                  </Button>
                  <Button
                    disabled={result.balance < box.price || box.owned >= box.total}
                    onClick={() => {
                      sequence.start(box.key)
                    }}
                    variant="outline"
                  >
                    {m.shop_opening_again({ price: box.price.toLocaleString(getLocale()) })}
                  </Button>
                  <Button
                    loading={equip.isPending}
                    onClick={() => {
                      const patch = toEquipPatch(result.item.kind, result.item.key)

                      if (patch === null) {
                        return
                      }

                      equip.mutate(patch, {
                        onSuccess: () => {
                          toastManager.add({
                            title: m.shop_equipped_toast({
                              name: getCosmeticLabel(result.item.kind, result.item.key),
                            }),
                            type: "success",
                          })
                          onClose()
                        },
                      })
                    }}
                  >
                    {m.shop_opening_equip()}
                  </Button>
                </div>
                <span sx={styles.balance}>
                  {m.shop_points({ points: result.balance.toLocaleString(getLocale()) })}
                </span>
              </>
            ) : null}
            {stage === "failed" ? (
              <Button onClick={onClose} variant="outline">
                {m.shop_opening_done()}
              </Button>
            ) : null}
          </footer>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

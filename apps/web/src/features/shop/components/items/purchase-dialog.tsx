import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { type ShopItem, useBuyShopItem } from "@/features/shop/api/shop"
import { ItemPreview, type ShopViewer } from "@/features/shop/components/items/item-preview"
import { PointsAmount } from "@/features/shop/components/points-amount"
import { createChestAudio } from "@/features/shop/lib/chest-audio"
import { SHOP_ERROR_MESSAGES } from "@/features/shop/lib/shop-errors"
import { useSoundPreference } from "@/features/shop/lib/use-sound-preference"
import { getCosmeticLabel } from "@/features/users/lib/cosmetic-labels"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  preview: {
    borderRadius: radius.xl,
    paddingBlock: "1.75rem",
    paddingInline: "1rem",
    alignItems: "center",
    backgroundColor: colors.well,
    display: "flex",
    justifyContent: "center",
    marginBottom: "1rem",
    minHeight: "8rem",
  },
  row: {
    paddingBlock: "0.25rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.875rem",
    justifyContent: "space-between",
  },
  value: {
    color: colors.foreground,
  },
})

export function PurchaseDialog({
  item,
  price,
  balance,
  viewer,
  onClose,
}: {
  item: ShopItem
  price: number
  balance: number
  viewer: ShopViewer
  onClose: () => void
}) {
  const buy = useBuyShopItem()
  const sound = useSoundPreference()
  const name = getCosmeticLabel(item.kind, item.key)

  return (
    <Dialog
      defaultOpen
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{m.shop_confirm_title({ name })}</DialogTitle>
          <DialogDescription>
            {m.shop_confirm_description({ price: price.toLocaleString(getLocale()) })}
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <ErrorAlert
            message={buy.isError ? getErrorMessage(buy.error, SHOP_ERROR_MESSAGES) : null}
          />
          <div sx={styles.preview}>
            <ItemPreview itemKey={item.key} kind={item.kind} size="5rem" viewer={viewer} />
          </div>
          <div sx={styles.row}>
            <span>{m.shop_balance_label()}</span>
            <PointsAmount points={balance} sx={styles.value} />
          </div>
          <div sx={styles.row}>
            <span>{m.shop_confirm_balance_after()}</span>
            <PointsAmount points={balance - price} sx={styles.value} />
          </div>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
          <Button
            disabled={balance < price || buy.isSuccess}
            loading={buy.isPending}
            onClick={() => {
              buy.mutate(
                { kind: item.kind, key: item.key },
                {
                  onSuccess: () => {
                    if (sound.enabled) {
                      const audio = createChestAudio()

                      void audio?.resume()
                      audio?.coin()
                      window.setTimeout(() => audio?.close(), 1500)
                    }

                    toastManager.add({ title: m.shop_purchased({ name }), type: "success" })
                    onClose()
                  },
                },
              )
            }}
          >
            {m.shop_confirm_buy({ price: price.toLocaleString(getLocale()) })}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}

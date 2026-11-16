import * as stylex from "@stylexjs/stylex"
import {
  AVATAR_BORDER_KEYS,
  type CosmeticKind,
  getCosmeticDefinition,
  NAME_EFFECT_KEYS,
  USER_TITLE_KEYS,
} from "@taiyomoe/db/cosmetics"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@taiyomoe/ui/components/ui/segmented-control"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import type { ManagedUser } from "@/features/users/api/users"
import { BulkEditDialog } from "@/features/catalog/components/shared/bulk-edit-dialog"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { ItemPreview } from "@/features/shop/components/items/item-preview"
import { RARITY_COLORS } from "@/features/shop/lib/rarity-colors"
import { useGiveUsersCosmetic } from "@/features/users/api/users"
import {
  COSMETIC_KIND_LABELS,
  getCosmeticLabel,
  RARITY_LABELS,
} from "@/features/users/lib/cosmetic-labels"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const KINDS = ["NAME_EFFECT", "AVATAR_BORDER", "TITLE"] as const satisfies readonly CosmeticKind[]
const KIND_LABELS: Record<CosmeticKind, () => string> = {
  NAME_EFFECT: m.users_cosmetic_kind_name_effect,
  AVATAR_BORDER: m.users_cosmetic_kind_avatar_border,
  TITLE: m.users_cosmetic_kind_title,
}
const KEYS: Record<CosmeticKind, readonly string[]> = {
  NAME_EFFECT: NAME_EFFECT_KEYS,
  AVATAR_BORDER: AVATAR_BORDER_KEYS,
  TITLE: USER_TITLE_KEYS,
}
const styles = stylex.create({
  grid: {
    gap: "0.5rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(8.5rem, 1fr))",
  },
  item: {
    font: "inherit",
    borderColor: { default: colors.border, ":is([aria-checked=true])": colors.primary },
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.5rem",
    paddingBlock: "0.75rem",
    paddingInline: "0.5rem",
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":is([aria-checked=true])": `color-mix(in srgb, ${colors.primary} 12%, transparent)`,
      ":hover": colors.muted,
    },
    color: colors.foreground,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    minWidth: 0,
  },
  preview: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    height: "3rem",
    maxWidth: "100%",
  },
  label: {
    overflow: "hidden",
    fontSize: "0.8125rem",
    fontWeight: 600,
    textAlign: "center",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  },
  rarity: (color: string) => ({
    color,
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  }),
  equip: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.875rem",
  },
})

export function CosmeticDialog({
  users,
  onClose,
  onDone,
}: {
  users: readonly ManagedUser[] | null
  onClose: () => void
  onDone?: (() => void) | undefined
}) {
  const give = useGiveUsersCosmetic()
  const [kind, setKind] = useState<CosmeticKind>("NAME_EFFECT")
  const [key, setKey] = useState<string | null>(null)
  const [equip, setEquip] = useState(true)
  const [only] = users ?? []
  const viewer = only ?? { id: "", displayUsername: "Taiyō", image: null }
  const close = () => {
    give.reset()
    setKind("NAME_EFFECT")
    setKey(null)
    setEquip(true)
    onClose()
  }

  return (
    <BulkEditDialog
      changed={key !== null}
      description={m.users_cosmetic_dialog_description()}
      error={give.isError ? getErrorMessage(give.error) : null}
      onClose={close}
      onSubmit={() => {
        if (users !== null && key !== null) {
          give.mutate(
            { userIds: users.map((user) => user.id), kind, key, equip },
            {
              onSuccess: (result) => {
                toastBulkResult(result, m.users_bulk_updated)
                onDone?.()
                close()
              },
            },
          )
        }
      }}
      open={users !== null}
      pending={give.isPending}
      title={
        users?.length === 1 && only !== undefined
          ? m.users_cosmetic_dialog_title_one({ name: only.displayUsername })
          : m.users_cosmetic_dialog_title({ count: users?.length ?? 0 })
      }
    >
      <SegmentedControl
        aria-label={m.users_cosmetic_kind()}
        fullWidth
        onValueChange={(value: unknown) => {
          const next = KINDS.find((item) => item === value)

          if (next !== undefined) {
            setKind(next)
            setKey(null)
          }
        }}
        value={kind}
      >
        {KINDS.map((item) => (
          <SegmentedControlItem key={item} value={item}>
            {KIND_LABELS[item]()}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
      <div aria-label={COSMETIC_KIND_LABELS[kind]()} role="radiogroup" sx={styles.grid}>
        {KEYS[kind].map((itemKey) => {
          const rarity = getCosmeticDefinition(kind, itemKey)?.rarity

          return (
            <button
              aria-checked={key === itemKey}
              key={itemKey}
              onClick={() => {
                setKey(itemKey)
              }}
              role="radio"
              sx={styles.item}
              type="button"
            >
              <span sx={styles.preview}>
                <ItemPreview itemKey={itemKey} kind={kind} size="2.5rem" viewer={viewer} />
              </span>
              <span sx={styles.label}>{getCosmeticLabel(kind, itemKey)}</span>
              {rarity === undefined ? null : (
                <span sx={styles.rarity(RARITY_COLORS[rarity].main)}>
                  {RARITY_LABELS[rarity]()}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <label sx={styles.equip}>
        <Checkbox
          checked={equip}
          onCheckedChange={(checked) => {
            setEquip(checked)
          }}
        />
        {m.users_cosmetic_equip()}
      </label>
    </BulkEditDialog>
  )
}

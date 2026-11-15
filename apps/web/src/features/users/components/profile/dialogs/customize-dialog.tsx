import type { AvatarBorder, CosmeticUnlock, NameEffect, UserTitle } from "@taiyomoe/db/cosmetics"
import * as stylex from "@stylexjs/stylex"
import { CheckCircle, Key } from "@taiyomoe/ui/components/icons"
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
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { breakpoints, colors, font, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { type ReactNode, useState } from "react"
import { range } from "remeda"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { UserName } from "@/components/user-name/user-name"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import {
  type MyCosmetics,
  myCosmeticsQueryOptions,
  type UserProfile,
  useEquipCosmetics,
} from "@/features/users/api/profile"
import { RARITY_STYLES } from "@/features/users/components/profile/rarity-styles"
import { TitleBadge } from "@/features/users/components/profile/title-badge"
import {
  AVATAR_BORDER_LABELS,
  describeUnlock,
  NAME_EFFECT_LABELS,
  RARITY_LABELS,
  USER_TITLE_LABELS,
} from "@/features/users/lib/cosmetic-labels"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  popup: {
    maxWidth: { default: "100%", [breakpoints.md]: "52rem" },
  },
  preview: {
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "1rem",
    paddingBlock: "1rem",
    paddingInline: "1.25rem",
    alignItems: "center",
    backgroundColor: colors.well,
    backgroundImage: `radial-gradient(120% 120% at 0% 0%, color-mix(in srgb, ${colors.primary} 12%, transparent), transparent 60%)`,
    display: "flex",
    marginBottom: "1rem",
  },
  previewAvatar: {
    height: "3.5rem",
    width: "3.5rem",
  },
  previewText: {
    gap: "0.375rem",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  previewName: {
    overflow: "hidden",
    fontSize: { default: "1.25rem", [breakpoints.sm]: "1.625rem" },
    fontWeight: 700,
    letterSpacing: "-0.01em",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  tabs: {
    gap: "1rem",
  },
  grid: {
    gap: "0.625rem",
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [breakpoints.md]: "repeat(3, minmax(0, 1fr))",
    },
  },
  option: {
    padding: "0.75rem",
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.5rem",
    alignItems: "stretch",
    backgroundColor: { default: colors.card, ":hover:not(:disabled)": colors.chipHover },
    color: "inherit",
    cursor: { default: "pointer", ":disabled": "not-allowed" },
    display: "flex",
    flexDirection: "column",
    fontFamily: "inherit",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    position: "relative",
    textAlign: "start",
    transitionDuration: motion.enter,
    transitionProperty: "background-color, border-color, box-shadow",
    minWidth: 0,
  },
  selected: {
    borderColor: colors.primary,
    boxShadow: `0 0 0 1px ${colors.primary}, 0 8px 24px -12px color-mix(in srgb, ${colors.primary} 60%, transparent)`,
  },
  locked: {
    borderStyle: "dashed",
    backgroundColor: `color-mix(in srgb, ${colors.card} 70%, transparent)`,
  },
  optionName: {
    overflow: "hidden",
    paddingBlock: "0.25rem",
    fontSize: "1.0625rem",
    fontWeight: 700,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  optionMeta: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  optionLabel: {
    fontSize: "0.8125rem",
    fontWeight: 600,
  },
  rarity: {
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    paddingInline: "0.375rem",
    fontSize: "0.625rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    lineHeight: "1rem",
    textTransform: "uppercase",
  },
  unlock: {
    gap: "0.375rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.75rem",
    lineHeight: 1.35,
  },
  progress: {
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 8%, transparent)`,
    height: "0.3125rem",
  },
  progressFill: {
    borderRadius: 4,
    backgroundColor: colors.primary,
    height: "100%",
  },
  progressText: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    fontVariantNumeric: "tabular-nums",
  },
  check: {
    color: colors.primary,
    display: "flex",
    position: "absolute",
    right: "0.5rem",
    top: "0.5rem",
  },
  titleOption: {
    alignItems: "flex-start",
  },
  plain: {
    color: colors.mutedForeground,
    fontStyle: "italic",
    fontWeight: 500,
  },
  count: {
    gap: "0.75rem",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
    justifyContent: "space-between",
    marginBottom: "0.75rem",
  },
  shopLink: {
    color: {
      default: colors.mutedForeground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    fontWeight: 600,
    textDecorationLine: "none",
    transitionDuration: "150ms",
    transitionProperty: "color",
  },
  borderOption: {
    alignItems: "center",
  },
  borderPreview: {
    paddingBlock: "0.75rem",
    display: "flex",
    justifyContent: "center",
  },
  borderAvatar: {
    height: "3rem",
    width: "3rem",
  },
  skeleton: {
    borderRadius: radius.lg,
    height: "6.5rem",
  },
})

type Item =
  | MyCosmetics["nameEffects"][number]
  | MyCosmetics["titles"][number]
  | MyCosmetics["avatarBorders"][number]

function Unlock({ item, progress }: { item: Item; progress: MyCosmetics["progress"] }) {
  const unlock: CosmeticUnlock = item.unlock

  if (item.unlocked || unlock.type !== "achievement") {
    return (
      <span sx={styles.unlock}>
        {item.unlocked ? null : <Key size={12} />}
        {describeUnlock(unlock)}
      </span>
    )
  }

  const current = Math.min(progress[unlock.metric], unlock.threshold)

  return (
    <>
      <span sx={styles.unlock}>
        <Key size={12} />
        {describeUnlock(unlock)}
      </span>
      <div aria-hidden sx={styles.progress}>
        <div style={{ width: `${(current / unlock.threshold) * 100}%` }} sx={styles.progressFill} />
      </div>
      <span sx={styles.progressText}>
        {m.profile_unlock_progress({
          current: current.toLocaleString(getLocale()),
          threshold: unlock.threshold.toLocaleString(getLocale()),
        })}
      </span>
    </>
  )
}

function Option({
  selected,
  locked,
  onSelect,
  children,
  sx,
}: {
  selected: boolean
  locked: boolean
  onSelect: () => void
  children: ReactNode
  sx?: stylex.StyleXStyles
}) {
  return (
    <button
      aria-pressed={selected}
      disabled={locked}
      onClick={onSelect}
      sx={[styles.option, selected && styles.selected, locked && styles.locked, sx]}
      type="button"
    >
      {selected ? (
        <span aria-hidden sx={styles.check}>
          <CheckCircle size={16} />
        </span>
      ) : null}
      {children}
    </button>
  )
}

function Rarity({ rarity }: { rarity: Item["rarity"] }) {
  return <span sx={[styles.rarity, RARITY_STYLES[rarity]]}>{RARITY_LABELS[rarity]()}</span>
}

function Picker({ profile, cosmetics }: { profile: UserProfile; cosmetics: MyCosmetics }) {
  const equip = useEquipCosmetics(profile.username)
  const [effect, setEffect] = useState<NameEffect | null>(cosmetics.nameEffect)
  const [title, setTitle] = useState<UserTitle | null>(cosmetics.title)
  const [border, setBorder] = useState<AvatarBorder | null>(cosmetics.avatarBorder)
  const changed =
    effect !== cosmetics.nameEffect ||
    title !== cosmetics.title ||
    border !== cosmetics.avatarBorder
  const unlockedEffects = cosmetics.nameEffects.filter((item) => item.unlocked).length
  const unlockedTitles = cosmetics.titles.filter((item) => item.unlocked).length
  const unlockedBorders = cosmetics.avatarBorders.filter((item) => item.unlocked).length
  const shopLink = (
    <Link {...stylex.props(styles.shopLink)} to="/shop">
      {m.profile_customize_visit_shop()}
    </Link>
  )
  // Unlocked first, then by rarity as the catalog orders it.
  const sorted = <T extends Item>(items: T[]) =>
    [...items].sort((a, b) => Number(b.unlocked) - Number(a.unlocked))

  return (
    <>
      <DialogPanel>
        <ErrorAlert message={equip.isError ? getErrorMessage(equip.error) : null} />
        <div sx={styles.preview}>
          <PersonAvatar person={{ ...profile, avatarBorder: border }} sx={styles.previewAvatar} />
          <div sx={styles.previewText}>
            <UserName effect={effect} name={profile.displayUsername} sx={styles.previewName} />
            <TitleBadge size="sm" title={title} />
          </div>
        </div>
        <Tabs defaultValue="effects" sx={styles.tabs}>
          <TabsList variant="underline">
            <TabsTab value="effects">{m.profile_customize_tab_effects()}</TabsTab>
            <TabsTab value="titles">{m.profile_customize_tab_titles()}</TabsTab>
            <TabsTab value="borders">{m.profile_customize_tab_borders()}</TabsTab>
          </TabsList>
          <TabsPanel value="effects">
            <p sx={styles.count}>
              {m.profile_customize_unlocked_count({
                count: unlockedEffects,
                total: cosmetics.nameEffects.length,
              })}
              {shopLink}
            </p>
            <div sx={styles.grid}>
              <Option
                locked={false}
                onSelect={() => {
                  setEffect(null)
                }}
                selected={effect === null}
              >
                <span sx={styles.optionName}>{profile.displayUsername}</span>
                <span sx={[styles.optionLabel, styles.plain]}>{m.profile_customize_plain()}</span>
              </Option>
              {sorted(cosmetics.nameEffects).map((item) => (
                <Option
                  key={item.key}
                  locked={!item.unlocked}
                  onSelect={() => {
                    setEffect(item.key)
                  }}
                  selected={effect === item.key}
                >
                  <UserName
                    effect={item.key}
                    name={profile.displayUsername}
                    sx={styles.optionName}
                  />
                  <span sx={styles.optionMeta}>
                    <span sx={styles.optionLabel}>{NAME_EFFECT_LABELS[item.key]()}</span>
                    <Rarity rarity={item.rarity} />
                  </span>
                  <Unlock item={item} progress={cosmetics.progress} />
                </Option>
              ))}
            </div>
          </TabsPanel>
          <TabsPanel value="titles">
            <p sx={styles.count}>
              {m.profile_customize_unlocked_count({
                count: unlockedTitles,
                total: cosmetics.titles.length,
              })}
              {shopLink}
            </p>
            <div sx={styles.grid}>
              <Option
                locked={false}
                onSelect={() => {
                  setTitle(null)
                }}
                selected={title === null}
                sx={styles.titleOption}
              >
                <span sx={[styles.optionLabel, styles.plain]}>
                  {m.profile_customize_no_title()}
                </span>
              </Option>
              {sorted(cosmetics.titles).map((item) => (
                <Option
                  key={item.key}
                  locked={!item.unlocked}
                  onSelect={() => {
                    setTitle(item.key)
                  }}
                  selected={title === item.key}
                  sx={styles.titleOption}
                >
                  <TitleBadge title={item.key} />
                  <span sx={styles.optionMeta}>
                    <span sx={styles.optionLabel}>{USER_TITLE_LABELS[item.key]()}</span>
                    <Rarity rarity={item.rarity} />
                  </span>
                  <Unlock item={item} progress={cosmetics.progress} />
                </Option>
              ))}
            </div>
          </TabsPanel>
          <TabsPanel value="borders">
            <p sx={styles.count}>
              {m.profile_customize_unlocked_count({
                count: unlockedBorders,
                total: cosmetics.avatarBorders.length,
              })}
              {shopLink}
            </p>
            <div sx={styles.grid}>
              <Option
                locked={false}
                onSelect={() => {
                  setBorder(null)
                }}
                selected={border === null}
                sx={styles.borderOption}
              >
                <span sx={styles.borderPreview}>
                  <PersonAvatar person={profile} sx={styles.borderAvatar} />
                </span>
                <span sx={[styles.optionLabel, styles.plain]}>
                  {m.profile_customize_no_border()}
                </span>
              </Option>
              {sorted(cosmetics.avatarBorders).map((item) => (
                <Option
                  key={item.key}
                  locked={!item.unlocked}
                  onSelect={() => {
                    setBorder(item.key)
                  }}
                  selected={border === item.key}
                  sx={styles.borderOption}
                >
                  <span sx={styles.borderPreview}>
                    <PersonAvatar
                      person={{ ...profile, avatarBorder: item.key }}
                      sx={styles.borderAvatar}
                    />
                  </span>
                  <span sx={styles.optionMeta}>
                    <span sx={styles.optionLabel}>{AVATAR_BORDER_LABELS[item.key]()}</span>
                    <Rarity rarity={item.rarity} />
                  </span>
                  <Unlock item={item} progress={cosmetics.progress} />
                </Option>
              ))}
            </div>
          </TabsPanel>
        </Tabs>
      </DialogPanel>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
        <Button
          disabled={!changed}
          loading={equip.isPending}
          onClick={() => {
            equip.mutate(
              {
                ...(effect === cosmetics.nameEffect ? {} : { nameEffect: effect }),
                ...(title === cosmetics.title ? {} : { title }),
                ...(border === cosmetics.avatarBorder ? {} : { avatarBorder: border }),
              },
              {
                onSuccess: () => {
                  toastManager.add({ title: m.profile_customize_equipped(), type: "success" })
                },
              },
            )
          }}
        >
          {m.profile_customize_equip()}
        </Button>
      </DialogFooter>
    </>
  )
}

export function CustomizeDialog({
  profile,
  onClose,
}: {
  profile: UserProfile
  onClose: () => void
}) {
  const cosmetics = useQuery(myCosmeticsQueryOptions)

  return (
    <Dialog
      defaultOpen
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogPopup sx={styles.popup}>
        <DialogHeader>
          <DialogTitle>{m.profile_customize_title()}</DialogTitle>
          <DialogDescription>{m.profile_customize_description()}</DialogDescription>
        </DialogHeader>
        {cosmetics.data === undefined ? (
          <DialogPanel>
            <ErrorAlert message={cosmetics.isError ? getErrorMessage(cosmetics.error) : null} />
            <div aria-hidden sx={styles.grid}>
              {range(0, 6).map((index) => (
                <Skeleton key={index} sx={styles.skeleton} />
              ))}
            </div>
          </DialogPanel>
        ) : (
          <Picker cosmetics={cosmetics.data} profile={profile} />
        )}
      </DialogPopup>
    </Dialog>
  )
}

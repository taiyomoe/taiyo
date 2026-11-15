import * as stylex from "@stylexjs/stylex"
import { Ellipsis } from "@taiyomoe/ui/components/icons"
import { CommandItem } from "@taiyomoe/ui/components/ui/command"
import { colors, consts, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { PaletteItem } from "@/features/command-palette/lib/palette-command"
import { CommandRowContent } from "@/features/command-palette/components/command-row-content"
import { GroupRowContent } from "@/features/command-palette/components/group-row-content"
import { TitleRowContent } from "@/features/command-palette/components/title-row-content"
import { UserRowContent } from "@/features/command-palette/components/user-row-content"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  row: {
    gap: "0.75rem",
    paddingInline: "0.75rem",
    minHeight: "2.75rem",
  },
  entity: {
    paddingBlock: "0.5rem",
    paddingInline: "0.5rem",
  },
  actions: {
    padding: 0,
    borderRadius: radius.md,
    borderStyle: "none",
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": colors.chipHover,
    },
    color: colors.mutedForeground,
    cursor: "pointer",
    display: {
      default: "none",
      [consts.pointerCoarse]: "inline-flex",
    },
    flexShrink: 0,
    justifyContent: "center",
    height: "2rem",
    width: "2rem",
  },
})

export function PaletteRow({
  item,
  onActivate,
  onOpenActions,
}: {
  item: PaletteItem
  onActivate: (item: PaletteItem, options: { newTab: boolean }) => void
  onOpenActions: (item: PaletteItem) => void
}) {
  return (
    <CommandItem
      onClick={(event) => {
        onActivate(item, { newTab: event.metaKey || event.ctrlKey })
      }}
      sx={[styles.row, item.kind === "entity" && styles.entity]}
      value={item}
    >
      {item.kind === "command" ? <CommandRowContent command={item.command} /> : null}
      {item.kind === "entity" && item.entity.kind === "title" ? (
        <TitleRowContent title={item.entity} />
      ) : null}
      {item.kind === "entity" && item.entity.kind === "group" ? (
        <GroupRowContent group={item.entity} />
      ) : null}
      {item.kind === "entity" && item.entity.kind === "user" ? (
        <UserRowContent user={item.entity} />
      ) : null}
      {item.kind === "entity" ? (
        <button
          aria-label={m.palette_actions()}
          onClick={(event) => {
            event.stopPropagation()
            onOpenActions(item)
          }}
          onPointerDown={(event) => {
            event.stopPropagation()
          }}
          sx={styles.actions}
          tabIndex={-1}
          type="button"
        >
          <Ellipsis size={18} />
        </button>
      ) : null}
    </CommandItem>
  )
}

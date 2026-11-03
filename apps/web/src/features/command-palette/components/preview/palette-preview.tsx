import * as stylex from "@stylexjs/stylex"
import { ScrollArea } from "@taiyomoe/ui/components/ui/scroll-area"
import { breakpoints, colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { PaletteItem } from "@/features/command-palette/lib/palette-command"
import { CommandPreview } from "@/features/command-palette/components/preview/command-preview"
import { GroupPreview } from "@/features/command-palette/components/preview/group-preview"
import { TitlePreview } from "@/features/command-palette/components/preview/title-preview"
import { UserPreview } from "@/features/command-palette/components/preview/user-preview"

const styles = stylex.create({
  aside: {
    display: { default: "none", [breakpoints.lg]: "flex" },
    flexDirection: "column",
    flexShrink: 0,
    borderLeftColor: colors.border,
    borderLeftStyle: "solid",
    borderLeftWidth: 1,
    minHeight: 0,
    width: "21rem",
  },
  scroll: {
    flex: "1",
    minHeight: 0,
  },
})
const PreviewContent = ({ item }: { item: PaletteItem }) => {
  if (item.kind === "command") {
    return <CommandPreview command={item.command} />
  }

  if (item.entity.kind === "title") {
    return <TitlePreview title={item.entity} />
  }

  return item.entity.kind === "group" ? (
    <GroupPreview group={item.entity} />
  ) : (
    <UserPreview user={item.entity} />
  )
}

export function PalettePreview({ item }: { item: PaletteItem | undefined }) {
  return (
    <aside data-slot="palette-preview" sx={styles.aside}>
      {item === undefined ? null : (
        <ScrollArea horizontal={false} scrollFade sx={styles.scroll}>
          <PreviewContent item={item} key={item.key} />
        </ScrollArea>
      )}
    </aside>
  )
}

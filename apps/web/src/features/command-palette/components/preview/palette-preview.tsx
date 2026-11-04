import * as stylex from "@stylexjs/stylex"
import { Eye } from "@taiyomoe/ui/components/icons"
import { ScrollArea } from "@taiyomoe/ui/components/ui/scroll-area"
import { breakpoints, colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { type PaletteEntity, entityKey } from "@/features/command-palette/lib/palette-command"
import { GroupPreview } from "@/features/command-palette/components/preview/group-preview"
import { TitlePreview } from "@/features/command-palette/components/preview/title-preview"
import { UserPreview } from "@/features/command-palette/components/preview/user-preview"
import { m } from "@/paraglide/messages"

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
  hint: {
    flex: "1",
    gap: "0.625rem",
    paddingInline: "2.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexDirection: "column",
    fontSize: "0.8125rem",
    justifyContent: "center",
    lineHeight: 1.45,
    textAlign: "center",
  },
  hintIcon: {
    opacity: 0.6,
  },
})
const PreviewContent = ({ entity }: { entity: PaletteEntity }) => {
  if (entity.kind === "title") {
    return <TitlePreview title={entity} />
  }

  return entity.kind === "group" ? <GroupPreview group={entity} /> : <UserPreview user={entity} />
}

export function PalettePreview({ entity }: { entity: PaletteEntity | undefined }) {
  return (
    <aside data-slot="palette-preview" sx={styles.aside}>
      {entity === undefined ? (
        <div sx={styles.hint}>
          <Eye size={20} {...stylex.props(styles.hintIcon)} />
          {m.palette_preview_empty()}
        </div>
      ) : (
        <ScrollArea horizontal={false} scrollFade sx={styles.scroll}>
          <PreviewContent entity={entity} key={entityKey(entity)} />
        </ScrollArea>
      )}
    </aside>
  )
}

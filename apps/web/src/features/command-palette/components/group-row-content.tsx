import * as stylex from "@stylexjs/stylex"
import type { GroupEntity } from "@/features/command-palette/lib/palette-command"
import { paletteRowStyles } from "@/features/command-palette/components/palette-row-styles"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  avatar: {
    height: "2.75rem",
    width: "2.75rem",
  },
})

export function GroupRowContent({ group }: { group: GroupEntity }) {
  return (
    <>
      <GroupAvatar
        id={group.id}
        logoUrl={group.logoUrl}
        name={group.name}
        sx={[paletteRowStyles.media, styles.avatar]}
      />
      <span sx={paletteRowStyles.text}>
        <span sx={paletteRowStyles.primary}>{group.name}</span>
        <span sx={paletteRowStyles.secondary}>
          {group.description === null || group.description === ""
            ? m.palette_group_no_description()
            : group.description}
        </span>
      </span>
    </>
  )
}

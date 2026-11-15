import * as stylex from "@stylexjs/stylex"
import type { UserEntity } from "@/features/command-palette/lib/palette-command"
import { UserName } from "@/components/user-name/user-name"
import { paletteRowStyles } from "@/features/command-palette/components/palette-row-styles"
import { PersonAvatar } from "@/features/groups/components/group-avatar"

const styles = stylex.create({
  avatar: {
    height: "2.5rem",
    width: "2.5rem",
  },
})

export function UserRowContent({ user }: { user: UserEntity }) {
  return (
    <>
      <PersonAvatar person={user} sx={styles.avatar} />
      <span sx={paletteRowStyles.text}>
        <span sx={paletteRowStyles.primary}>
          <UserName effect={user.nameEffect} name={user.displayUsername} />
        </span>
        <span sx={paletteRowStyles.secondary}>@{user.username}</span>
      </span>
    </>
  )
}

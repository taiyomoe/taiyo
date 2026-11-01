import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { Avatar, AvatarFallback, AvatarImage } from "@taiyomoe/ui/components/ui/avatar"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { LatestChapter } from "@/features/chapters/api/chapters"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  uploader: {
    gap: "0.5rem",
    alignItems: "center",
    color: `color-mix(in srgb, ${colors.foreground} 82%, transparent)`,
    display: "flex",
    fontSize: "0.8125rem",
    fontWeight: 500,
    minWidth: 0,
  },
  avatar: {
    fontSize: "0.625rem",
    fontWeight: 700,
    height: "1.375rem",
    width: "1.375rem",
  },
  avatarFallback: {
    backgroundColor: `color-mix(in srgb, ${colors.primary} 22%, ${colors.card})`,
    color: `color-mix(in srgb, ${colors.primary} 70%, ${colors.foreground})`,
  },
  uploaderName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

export function Uploader({ uploader, sx }: { uploader: LatestChapter["uploader"]; sx?: Sx }) {
  return (
    <span
      sx={[styles.uploader, sx]}
      title={m.chapter_uploaded_by({ name: uploader.displayUsername })}
    >
      <Avatar sx={styles.avatar}>
        {uploader.image === null ? null : <AvatarImage alt="" src={uploader.image} />}
        <AvatarFallback sx={styles.avatarFallback}>
          {uploader.displayUsername.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span sx={styles.uploaderName}>{uploader.displayUsername}</span>
    </span>
  )
}

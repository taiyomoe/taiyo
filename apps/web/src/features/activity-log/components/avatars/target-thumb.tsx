import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement } from "react"
// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import {
  Banner,
  CloudUpload,
  Comment,
  Flag,
  History,
  Image,
  Library,
  List,
  ListNumbered,
  Mail,
  NoteEdit,
  PenTool,
  Shield,
  User,
  UserCheck,
  Users,
} from "@taiyomoe/ui/components/icons"
import type { AuditLogEntry } from "@/features/activity-log/api/audit-logs"
import { avatarStyles } from "@/features/activity-log/components/avatars/avatar-styles"
import { CoverThumb } from "@/features/activity-log/components/avatars/cover-thumb"
import { LogoTile } from "@/features/activity-log/components/avatars/logo-tile"
import { PersonAvatar } from "@/features/activity-log/components/avatars/person-avatar"
import { getCategoryTone } from "@/features/activity-log/lib/avatar-tones"

const TARGET_ICONS: Record<string, (props: IconProps) => ReactElement> = {
  media: Library,
  mediaSuggestion: NoteEdit,
  cover: Image,
  banner: Banner,
  chapter: ListNumbered,
  task: CloudUpload,
  group: Users,
  ownershipRequest: Shield,
  groupCreationRequest: UserCheck,
  groupInvitation: Mail,
  groupReport: Flag,
  user: User,
  staff: PenTool,
  list: List,
  auditLog: History,
  pageReport: Flag,
  comment: Comment,
  commentReport: Flag,
  commentImage: Image,
}

export function TargetThumb({
  preview,
  targetType,
  category,
  size = "2rem",
}: {
  preview: AuditLogEntry["preview"]
  targetType: string
  category: string
  size?: string
}) {
  if (preview?.kind === "media") {
    return <CoverThumb height={`calc(${size} * 1.4)`} src={preview.image} />
  }

  if (preview?.kind === "group") {
    return <LogoTile preview={preview} size={size} />
  }

  if (preview?.kind === "user" || preview?.kind === "staff") {
    return (
      <PersonAvatar
        border={preview.avatarBorder}
        image={preview.image}
        name={preview.label ?? "?"}
        seed={preview.id}
        size={size}
      />
    )
  }

  const Icon = TARGET_ICONS[targetType] ?? History

  return (
    <span aria-hidden sx={[avatarStyles.tile(getCategoryTone(category)), avatarStyles.size(size)]}>
      <Icon size={16} />
    </span>
  )
}

import { ROLES, type Role } from "@taiyomoe/permissions"
import {
  CloudUpload,
  Crown,
  GraduationCap,
  type IconProps,
  Shield,
  User,
  Users,
} from "@taiyomoe/ui/components/icons"
import type { OptionSet } from "@/components/fields/option-select"
import { m } from "@/paraglide/messages"

export const ROLE_LABELS: Record<Role, () => string> = {
  USER: m.role_user,
  MODERATOR: m.role_moderator,
  UPLOADER_INTERN: m.role_uploader_intern,
  UPLOADER: m.role_uploader,
  ADMIN: m.role_admin,
}

const ROLE_ICONS: Record<Role, (props: IconProps) => React.ReactElement> = {
  USER: User,
  MODERATOR: Shield,
  UPLOADER_INTERN: GraduationCap,
  UPLOADER: CloudUpload,
  ADMIN: Crown,
}

export const ROLE_OPTIONS: OptionSet<Role> = {
  values: ROLES,
  label: (role) => ROLE_LABELS[role](),
  icon: (role) => ROLE_ICONS[role],
  fieldIcon: Users,
}

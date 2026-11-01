import type { Role } from "@taiyomoe/permissions"
import { m } from "@/paraglide/messages"

export const ROLE_LABELS: Record<Role, () => string> = {
  USER: m.role_user,
  MODERATOR: m.role_moderator,
  UPLOADER_INTERN: m.role_uploader_intern,
  UPLOADER: m.role_uploader,
  ADMIN: m.role_admin,
}

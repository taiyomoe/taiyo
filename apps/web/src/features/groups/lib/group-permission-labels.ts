import type { GroupPermission } from "@taiyomoe/permissions"
import { m } from "@/paraglide/messages"

export const GROUP_PERMISSION_LABELS: Record<
  GroupPermission,
  { label: () => string; description: () => string }
> = {
  UPLOAD_CHAPTERS: {
    label: m.group_permission_upload_chapters,
    description: m.group_permission_upload_chapters_description,
  },
  EDIT_CHAPTERS: {
    label: m.group_permission_edit_chapters,
    description: m.group_permission_edit_chapters_description,
  },
  DELETE_CHAPTERS: {
    label: m.group_permission_delete_chapters,
    description: m.group_permission_delete_chapters_description,
  },
  EDIT_GROUP: {
    label: m.group_permission_edit_group,
    description: m.group_permission_edit_group_description,
  },
  MANAGE_MEMBERS: {
    label: m.group_permission_manage_members,
    description: m.group_permission_manage_members_description,
  },
}

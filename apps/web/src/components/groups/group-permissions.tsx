import type { GroupMembershipRole, GroupPermission } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { GROUP_PERMISSIONS } from "@taiyomoe/permissions"
import { Crown } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import { CheckboxGroup } from "@taiyomoe/ui/components/ui/checkbox-group"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
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

const styles = stylex.create({
  list: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
  },
  option: {
    padding: "0.75rem",
    borderRadius: radius.lg,
    gap: "0.75rem",
    alignItems: "flex-start",
    backgroundColor: {
      default: "transparent",
      ":hover": `color-mix(in srgb, ${colors.foreground} 4%, transparent)`,
    },
    cursor: "pointer",
    display: "flex",
  },
  disabled: {
    cursor: "not-allowed",
    opacity: 0.5,
  },
  checkbox: {
    marginTop: "0.125rem",
  },
  text: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "0.9375rem",
    fontWeight: 500,
  },
  description: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    lineHeight: 1.4,
  },
  chips: {
    gap: "0.375rem",
    display: "flex",
    flexWrap: "wrap",
  },
  muted: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
  crown: {
    color: colors.warning,
    height: "0.875rem",
    width: "0.875rem",
  },
})

type PermissionChecklistProps = {
  value: readonly GroupPermission[]
  onChange: (value: GroupPermission[]) => void
  canToggle: (permission: GroupPermission) => boolean
  disabled?: boolean
}

export function PermissionChecklist({
  value,
  onChange,
  canToggle,
  disabled = false,
}: PermissionChecklistProps) {
  return (
    <CheckboxGroup
      onValueChange={(next) => {
        onChange(GROUP_PERMISSIONS.filter((permission) => next.includes(permission)))
      }}
      sx={styles.list}
      value={[...value]}
    >
      {GROUP_PERMISSIONS.map((permission) => {
        const locked = disabled || !canToggle(permission)

        return (
          <label
            key={permission}
            sx={[styles.option, locked && styles.disabled]}
            title={locked && !disabled ? m.group_permission_not_grantable() : undefined}
          >
            <Checkbox disabled={locked} name={permission} sx={styles.checkbox} value={permission} />
            <span sx={styles.text}>
              <span sx={styles.label}>{GROUP_PERMISSION_LABELS[permission].label()}</span>
              <span sx={styles.description}>
                {GROUP_PERMISSION_LABELS[permission].description()}
              </span>
            </span>
          </label>
        )
      })}
    </CheckboxGroup>
  )
}

export function PermissionChips({ permissions }: { permissions: readonly GroupPermission[] }) {
  return (
    <div sx={styles.chips}>
      {permissions.map((permission) => (
        <Badge key={permission} variant="secondary">
          {GROUP_PERMISSION_LABELS[permission].label()}
        </Badge>
      ))}
    </div>
  )
}

export function RoleBadge({ role }: { role: GroupMembershipRole }) {
  return role === "OWNER" ? (
    <Badge variant="secondary">
      <Crown {...stylex.props(styles.crown)} />
      {m.group_role_owner()}
    </Badge>
  ) : (
    <Badge variant="outline">{m.group_role_member()}</Badge>
  )
}

export function MemberPermissions({
  role,
  permissions,
  showOwner = false,
}: {
  role: GroupMembershipRole
  permissions: readonly GroupPermission[] | null
  showOwner?: boolean
}) {
  if (role === "OWNER") {
    return showOwner ? <span sx={styles.muted}>{m.my_groups_all_permissions()}</span> : null
  }

  if (permissions === null) {
    return null
  }

  if (permissions.length === 0) {
    return <span sx={styles.muted}>{m.my_groups_no_permissions()}</span>
  }

  return <PermissionChips permissions={permissions} />
}

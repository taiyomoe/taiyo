import type { GroupPermission } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { GROUP_PERMISSIONS } from "@taiyomoe/permissions"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import { CheckboxGroup } from "@taiyomoe/ui/components/ui/checkbox-group"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { GROUP_PERMISSION_LABELS } from "@/features/groups/lib/group-permission-labels"
import { m } from "@/paraglide/messages"

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
})

export function PermissionChecklist({
  value,
  onChange,
  canToggle,
  disabled = false,
}: {
  value: readonly GroupPermission[]
  onChange: (value: GroupPermission[]) => void
  canToggle: (permission: GroupPermission) => boolean
  disabled?: boolean
}) {
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

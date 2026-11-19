import type { GroupPermission } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { GROUP_PERMISSIONS } from "@taiyomoe/permissions"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
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

/**
 * Every group permission with what it allows. A permission is checked, unchecked, or `mixed`
 * when only some of the members being edited hold it.
 */
export function PermissionChecklist({
  checked,
  onToggle,
  canToggle,
  disabled = false,
}: {
  checked: (permission: GroupPermission) => boolean | "mixed"
  onToggle: (permission: GroupPermission) => void
  canToggle: (permission: GroupPermission) => boolean
  disabled?: boolean
}) {
  return (
    <div role="group" sx={styles.list}>
      {GROUP_PERMISSIONS.map((permission) => {
        const locked = disabled || !canToggle(permission)
        const state = checked(permission)

        return (
          <label
            key={permission}
            sx={[styles.option, locked && styles.disabled]}
            title={locked && !disabled ? m.group_permission_not_grantable() : undefined}
          >
            <Checkbox
              checked={state === true}
              disabled={locked}
              indeterminate={state === "mixed"}
              name={permission}
              onCheckedChange={() => {
                onToggle(permission)
              }}
              sx={styles.checkbox}
            />
            <span sx={styles.text}>
              <span sx={styles.label}>{GROUP_PERMISSION_LABELS[permission].label()}</span>
              <span sx={styles.description}>
                {GROUP_PERMISSION_LABELS[permission].description()}
              </span>
            </span>
          </label>
        )
      })}
    </div>
  )
}

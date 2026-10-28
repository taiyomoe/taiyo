import type { GroupPermission } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { GROUP_PERMISSION_LABELS } from "@/features/groups/lib/group-permission-labels"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  grants: {
    padding: "1rem",
    borderRadius: `calc(${radius.xxl} - 0.75rem)`,
    gap: "0.625rem",
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 3%, transparent)`,
    display: "flex",
    flexDirection: "column",
  },
  grantsTitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
  grantList: {
    margin: 0,
    padding: 0,
    gap: "0.5rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  grant: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
  },
  grantLabel: {
    fontSize: "0.9375rem",
    fontWeight: 500,
  },
  grantDescription: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
})

export function InvitationGrants({ permissions }: { permissions: readonly GroupPermission[] }) {
  return (
    <div sx={styles.grants}>
      {permissions.length === 0 ? (
        <p sx={styles.grantsTitle}>{m.invitation_grants_nothing()}</p>
      ) : (
        <>
          <p sx={styles.grantsTitle}>{m.invitation_grants()}</p>
          <ul sx={styles.grantList}>
            {permissions.map((permission) => (
              <li key={permission} sx={styles.grant}>
                <span sx={styles.grantLabel}>{GROUP_PERMISSION_LABELS[permission].label()}</span>
                <span sx={styles.grantDescription}>
                  {GROUP_PERMISSION_LABELS[permission].description()}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

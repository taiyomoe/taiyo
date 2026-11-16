import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { Edit, ExternalLink, Library, Trash } from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { Link } from "@tanstack/react-router"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type { ManagedStaff } from "@/features/staffs/api/staffs"
import { Pill } from "@/components/badges/pill"
import { TimeAgo } from "@/components/time/time-ago"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { mediaCellStyles, TitleCell, Folded } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { formatNumber } from "@/features/dashboard/lib/format"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { STAFF_ROLE_OPTIONS } from "@/features/media/lib/media-options"
import { m } from "@/paraglide/messages"

export function StaffRow({
  staff,
  can,
  selection,
  onRename,
  onDelete,
}: {
  staff: ManagedStaff
  can: Permissions
  selection: Selection | undefined
  onRename: () => void
  onDelete: () => void
}) {
  const roles =
    staff.roles.length === 0 ? (
      <span {...stylex.props(catalogStyles.muted)}>{m.staffs_no_role()}</span>
    ) : (
      staff.roles.map((role) => (
        <Pill icon={STAFF_ROLE_OPTIONS.icon(role)} key={role}>
          {STAFF_ROLE_OPTIONS.label(role)}
        </Pill>
      ))
    )
  const actions: RowAction[] = [
    ...(staff.mediaCount === 0
      ? []
      : [
          {
            key: "media",
            label: m.staffs_view_media(),
            icon: ExternalLink,
            render: (
              <Link
                search={
                  staff.roles.includes("AUTHOR") ? { authors: staff.id } : { artists: staff.id }
                }
                to="/media"
              />
            ),
          },
        ]),
    {
      key: "rename",
      label: m.staffs_rename(),
      icon: Edit,
      onClick: onRename,
    },
    ...(can("staff.delete")
      ? [
          {
            key: "delete",
            label: m.catalog_delete(),
            icon: Trash,
            destructive: true,
            onClick: onDelete,
          },
        ]
      : []),
  ]

  return (
    <TableRow>
      {selection === undefined ? null : (
        <CatalogSelectCell id={staff.id} label={staff.name} selection={selection} />
      )}
      <CatalogCell column="staff">
        <TitleCell
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">
                  {roles}
                  <span {...stylex.props(catalogStyles.inline, catalogStyles.muted)}>
                    <Library size={14} />
                    {formatNumber(staff.mediaCount)}
                  </span>
                </Folded>
                <span {...stylex.props(catalogStyles.muted)}>
                  <TimeAgo date={staff.createdAt} length="long" />
                </span>
              </>
            ),
          }}
          thumb={
            <PersonAvatar
              person={{ id: staff.id, displayUsername: staff.name, image: staff.imageUrl }}
              sx={mediaCellStyles.avatar}
            />
          }
          title={
            <span sx={mediaCellStyles.title} title={staff.name}>
              {staff.name}
            </span>
          }
        />
      </CatalogCell>
      <CatalogCell column="roles">
        <div {...stylex.props(catalogStyles.inline)}>{roles}</div>
      </CatalogCell>
      <CatalogCell column="media" sx={catalogStyles.numeric}>
        {formatNumber(staff.mediaCount)}
      </CatalogCell>
      <CatalogCell column="date" sx={catalogStyles.muted}>
        <TimeAgo date={staff.createdAt} length="long" />
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions actions={actions} label={m.catalog_actions({ name: staff.name })} />
      </CatalogCell>
    </TableRow>
  )
}

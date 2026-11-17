import * as stylex from "@stylexjs/stylex"
import { CancelCircle, ExternalLink, Eye } from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { MangaDexSyncSummary } from "@/features/mangadex-sync/api/mangadex-sync"
import { TimeAgo } from "@/components/time/time-ago"
import { CatalogCell } from "@/features/catalog/components/shared/catalog-table"
import { Folded, mediaCellStyles, TitleCell } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { Uploader } from "@/features/chapters/components/uploader"
import { isActiveMangaDexSync } from "@/features/mangadex-sync/api/mangadex-sync"
import { SyncStatusPill } from "@/features/mangadex-sync/components/sync-status-pill"
import { describeAdded, describeItems, syncName } from "@/features/mangadex-sync/lib/sync-summary"
import { MEDIA_LINKS } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  title: {
    font: "inherit",
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    cursor: "pointer",
    textAlign: "start",
    maxWidth: "100%",
  },
  // Every count the sync added stays readable: two lines before it clamps.
  clamp: {
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    display: "-webkit-box",
    lineHeight: 1.35,
    overflowWrap: "anywhere",
    whiteSpace: "normal",
  },
  nothing: {
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
  error: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    color: colors.mutedForeground,
    display: "-webkit-box",
    fontSize: "0.8125rem",
    lineHeight: 1.35,
    overflowWrap: "anywhere",
    whiteSpace: "normal",
  },
  text: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    lineHeight: 1.35,
    whiteSpace: "normal",
  },
})

export function SyncHistoryRow({
  sync,
  cancelling,
  onDetails,
  onCancel,
}: {
  sync: MangaDexSyncSummary
  cancelling: boolean
  onDetails: () => void
  onCancel: () => void
}) {
  const name = syncName(sync)
  const added = describeAdded(sync)
  const progress = describeItems(sync)
  const items = progress === null ? null : <span sx={styles.text}>{progress}</span>
  const user = (
    <Uploader
      title={m.mangadex_history_by({ name: sync.user.displayUsername })}
      uploader={sync.user}
    />
  )
  const date = <TimeAgo date={sync.createdAt} length="long" />
  const actions: RowAction[] = [
    { key: "details", label: m.mangadex_view_details(), icon: Eye, onClick: onDetails },
    {
      key: "mangadex",
      label: m.mangadex_open_on_mangadex(),
      icon: ExternalLink,
      render: (
        <a href={MEDIA_LINKS.mangaDex?.href(sync.mangaDexId)} rel="noreferrer" target="_blank" />
      ),
    },
    ...(isActiveMangaDexSync(sync.status)
      ? [
          {
            key: "cancel",
            label: m.mangadex_cancel(),
            icon: CancelCircle,
            destructive: true,
            disabled: cancelling,
            onClick: onCancel,
          },
        ]
      : []),
  ]

  return (
    <TableRow>
      <CatalogCell column="sync">
        <TitleCell
          detail={
            sync.error === null ? undefined : (
              <span sx={styles.error} title={sync.error}>
                {sync.error}
              </span>
            )
          }
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">
                  <SyncStatusPill status={sync.status} />
                  <span {...stylex.props(catalogStyles.muted)}>{date}</span>
                </Folded>
                {items}
                {user}
              </>
            ),
          }}
          title={
            <button
              onClick={onDetails}
              sx={[
                styles.title,
                mediaCellStyles.title,
                styles.clamp,
                added.empty && styles.nothing,
              ]}
              title={added.text}
              type="button"
            >
              {added.text}
            </button>
          }
        />
      </CatalogCell>
      <CatalogCell column="status">
        <SyncStatusPill status={sync.status} />
      </CatalogCell>
      <CatalogCell column="items">{items ?? <span sx={styles.text}>—</span>}</CatalogCell>
      <CatalogCell column="by">{user}</CatalogCell>
      <CatalogCell column="date" sx={catalogStyles.muted}>
        {date}
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions actions={actions} label={m.catalog_actions({ name })} />
      </CatalogCell>
    </TableRow>
  )
}

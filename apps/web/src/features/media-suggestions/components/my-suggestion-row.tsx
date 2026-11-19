import * as stylex from "@stylexjs/stylex"
import { Edit, ExternalLink, Eye, Undo } from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type { MediaSuggestion } from "@/features/media-suggestions/api/media-suggestions"
import { Pill } from "@/components/badges/pill"
import { TimeAgo } from "@/components/time/time-ago"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { mediaCellStyles, TitleCell, Folded } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { SuggestionFields } from "@/features/media-suggestions/components/suggestion-fields"
import { SUGGESTION_STATUS } from "@/features/media-suggestions/lib/suggestion-status"
import { Cover } from "@/features/media/components/cover"
import { m } from "@/paraglide/messages"

export const suggestionRowStyles = stylex.create({
  note: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    color: colors.mutedForeground,
    display: "-webkit-box",
    fontSize: "0.8125rem",
    lineHeight: 1.35,
    overflowWrap: "anywhere",
    whiteSpace: "pre-line",
  },
})

export function MySuggestionRow({
  suggestion,
  selection,
  onWithdraw,
}: {
  suggestion: MediaSuggestion
  selection: Selection | undefined
  onWithdraw: () => void
}) {
  const title = suggestion.media.title ?? m.media_untitled()
  const pending = suggestion.status === "PENDING"
  const status = (
    <Pill variant={SUGGESTION_STATUS[suggestion.status].variant}>
      {SUGGESTION_STATUS[suggestion.status].label()}
    </Pill>
  )
  const actions: RowAction[] = [
    {
      key: "view",
      label: m.my_suggestions_view(),
      icon: Eye,
      render: (
        <Link params={{ suggestionId: suggestion.id }} to="/dashboard/suggestions/$suggestionId" />
      ),
    },
    ...(pending
      ? [
          {
            key: "edit",
            label: m.my_suggestions_edit(),
            icon: Edit,
            render: <Link params={{ mediaId: suggestion.media.id }} to="/media/$mediaId/edit" />,
          },
        ]
      : []),
    {
      key: "media",
      label: m.suggestion_open_media(),
      icon: ExternalLink,
      render: (
        <Link
          params={{ mediaId: suggestion.media.id }}
          search={{ tab: "info" }}
          to="/media/$mediaId"
        />
      ),
    },
    ...(pending
      ? [
          {
            key: "withdraw",
            label: m.my_suggestions_withdraw(),
            icon: Undo,
            destructive: true,
            onClick: onWithdraw,
          },
        ]
      : []),
  ]

  return (
    <TableRow>
      {selection === undefined ? null : (
        <CatalogSelectCell
          disabled={!pending}
          id={suggestion.id}
          label={title}
          selection={selection}
        />
      )}
      <CatalogCell column="media">
        <TitleCell
          detail={
            suggestion.reviewerNote === null ? undefined : (
              <span sx={suggestionRowStyles.note} title={suggestion.reviewerNote}>
                {m.suggestion_reviewer_note({ note: suggestion.reviewerNote })}
              </span>
            )
          }
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">{status}</Folded>
                <SuggestionFields suggestion={suggestion} />
                <span {...stylex.props(catalogStyles.muted)}>
                  <TimeAgo date={suggestion.createdAt} length="long" />
                </span>
              </>
            ),
          }}
          thumb={<Cover src={suggestion.media.coverUrl} sx={mediaCellStyles.cover} />}
          title={
            <Link
              params={{ suggestionId: suggestion.id }}
              to="/dashboard/suggestions/$suggestionId"
              {...stylex.props(mediaCellStyles.title)}
            >
              {title}
            </Link>
          }
        />
      </CatalogCell>
      <CatalogCell column="status">{status}</CatalogCell>
      <CatalogCell column="fields">
        <div {...stylex.props(catalogStyles.inline)}>
          <SuggestionFields suggestion={suggestion} />
        </div>
      </CatalogCell>
      <CatalogCell column="date" sx={catalogStyles.muted}>
        <TimeAgo date={suggestion.createdAt} length="long" />
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions actions={actions} label={m.catalog_actions({ name: title })} />
      </CatalogCell>
    </TableRow>
  )
}

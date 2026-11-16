import * as stylex from "@stylexjs/stylex"
import { CancelCircle, CheckCircle, ExternalLink, Eye } from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { Link } from "@tanstack/react-router"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type { MediaSuggestion } from "@/features/media-suggestions/api/media-suggestions"
import { TimeAgo } from "@/components/time/time-ago"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { mediaCellStyles, TitleCell, Folded } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { Uploader } from "@/features/chapters/components/uploader"
import { suggestionRowStyles } from "@/features/media-suggestions/components/my-suggestion-row"
import { SuggestionFields } from "@/features/media-suggestions/components/suggestion-fields"
import { Cover } from "@/features/media/components/cover"
import { m } from "@/paraglide/messages"

export function QueueSuggestionRow({
  suggestion,
  selection,
  onAccept,
  onReject,
}: {
  suggestion: MediaSuggestion
  selection: Selection
  onAccept: () => void
  onReject: () => void
}) {
  const title = suggestion.media.title ?? m.media_untitled()
  const actions: RowAction[] = [
    {
      key: "review",
      label: m.review_chapter(),
      icon: Eye,
      render: (
        <Link params={{ suggestionId: suggestion.id }} to="/dashboard/suggestions/$suggestionId" />
      ),
    },
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
    ...(suggestion.conflicts.length === 0
      ? [
          {
            key: "accept",
            label: m.suggestions_accept_as_is(),
            icon: CheckCircle,
            onClick: onAccept,
          },
        ]
      : []),
    {
      key: "reject",
      label: m.suggestions_reject(),
      icon: CancelCircle,
      destructive: true,
      onClick: onReject,
    },
  ]

  return (
    <TableRow>
      <CatalogSelectCell id={suggestion.id} label={title} selection={selection} />
      <CatalogCell column="media">
        <TitleCell
          detail={
            suggestion.note === null ? undefined : (
              <span sx={suggestionRowStyles.note} title={suggestion.note}>
                {suggestion.note}
              </span>
            )
          }
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">
                  <SuggestionFields suggestion={suggestion} />
                </Folded>
                <Uploader uploader={suggestion.author} />
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
      <CatalogCell column="fields">
        <div {...stylex.props(catalogStyles.inline)}>
          <SuggestionFields suggestion={suggestion} />
        </div>
      </CatalogCell>
      <CatalogCell column="author">
        <Uploader uploader={suggestion.author} />
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

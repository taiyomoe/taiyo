import { Comment, Trash, User } from "@taiyomoe/ui/components/icons"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type {
  ManagedComment,
  ManagedCommentsFilter,
} from "@/features/comments/api/managed-comments"
import {
  FilterSearch,
  FilterSelect,
  FilterToggle,
  FilterToolbar,
} from "@/components/filters/filter-toolbar"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import { CATALOG_PER_PAGE } from "@/features/catalog/api/catalog"
import { BulkBar, BulkDeleteButton } from "@/features/catalog/components/shared/bulk-bar"
import {
  SkeletonActions,
  SkeletonIconText,
  SkeletonMediaCell,
  SkeletonText,
} from "@/features/catalog/components/shared/catalog-skeletons"
import {
  CatalogFooter,
  CatalogTable,
  VisuallyHidden,
} from "@/features/catalog/components/shared/catalog-table"
import { useSelection } from "@/features/catalog/hooks/use-selection"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { managedCommentsQueryOptions } from "@/features/comments/api/managed-comments"
import { DeleteCommentsDialog } from "@/features/comments/components/manage/delete-comments-dialog"
import { ManagedCommentRow } from "@/features/comments/components/manage/managed-comment-row"
import { COMMENT_TARGET_OPTIONS } from "@/features/comments/lib/comment-target-options"
import { formatNumber } from "@/features/dashboard/lib/format"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/comments")

export function CommentsPage() {
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const filter: ManagedCommentsFilter = {
    search: params.q,
    target: params.target,
    authorId: params.author,
    deleted: params.deleted,
    page: params.page ?? 1,
  }
  const { data, isPlaceholderData } = useQuery(
    managedCommentsQueryOptions(useDeferredValue(filter)),
  )
  const live = filter.deleted !== true
  const selection = useSelection(data?.data.map((comment) => comment.id) ?? [])
  const [deleting, setDeleting] = useState<{ comments: ManagedComment[]; bulk: boolean } | null>(
    null,
  )
  const author = data?.data.find((comment) => comment.author?.id === filter.authorId)?.author
  const search = (next: ManagedCommentsFilter) => ({
    q: next.search,
    target: next.target,
    author: next.authorId,
    deleted: next.deleted === true ? true : undefined,
    page: next.page === 1 ? undefined : next.page,
  })
  const update = (patch: Partial<ManagedCommentsFilter>) => {
    void navigate({
      replace: true,
      search: search({ ...filter, ...patch, page: patch.page ?? 1 }),
    })
  }

  return (
    <DashboardPage subtitle={m.comments_manage_subtitle()} title={m.dashboard_nav_comments()}>
      <CatalogTable
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            <BulkDeleteButton
              onClick={() => {
                setDeleting({
                  comments: data?.data.filter((comment) => selection.has(comment.id)) ?? [],
                  bulk: true,
                })
              }}
            />
          </BulkBar>
        }
        columns={[
          {
            key: "comment",
            label: m.comments_column_comment(),
            skeleton: (
              <SkeletonMediaCell narrow={{ from: "3xl", content: "pills" }} thumb="avatar" />
            ),
          },
          {
            key: "target",
            label: m.comments_column_target(),
            width: catalogStyles.colTarget,
            from: "3xl",
            skeleton: <SkeletonIconText width="7rem" />,
          },
          {
            key: "stats",
            label: m.comments_column_stats(),
            width: catalogStyles.colMedium,
            from: "4xl",
            skeleton: <SkeletonIconText width="1.5rem" />,
          },
          {
            key: "date",
            label: live ? m.comments_column_posted() : m.catalog_column_deleted(),
            width: catalogStyles.colMedium,
            from: "3xl",
            skeleton: <SkeletonText width="5.5rem" />,
          },
          {
            key: "actions",
            label: <VisuallyHidden>{m.catalog_column_actions()}</VisuallyHidden>,
            width: catalogStyles.colActions,
            skeleton: <SkeletonActions />,
          },
        ]}
        empty={
          data?.data.length === 0
            ? {
                icon: Comment,
                title: m.comments_manage_empty_title(),
                description: m.catalog_empty_description(),
              }
            : null
        }
        fetching={isPlaceholderData}
        footer={
          data === undefined ? null : (
            <CatalogFooter total={m.catalog_results({ count: formatNumber(data.meta.total) })}>
              <PagePagination
                fit="container"
                onJump={(page) => {
                  update({ page })
                }}
                page={filter.page}
                pageCount={Math.ceil(data.meta.total / CATALOG_PER_PAGE)}
                renderLink={(page) => (
                  <Link search={search({ ...filter, page })} to="/dashboard/comments" />
                )}
              />
            </CatalogFooter>
          )
        }
        loading={data === undefined}
        selection={live ? selection : undefined}
        toolbar={
          <FilterToolbar>
            <FilterSearch
              label={m.comments_manage_search()}
              onChange={(next) => {
                update({ search: next })
              }}
              value={filter.search}
            />
            <FilterSelect
              allLabel={m.comments_all_targets()}
              label={m.comments_column_target()}
              onChange={(target) => {
                update({ target })
              }}
              options={COMMENT_TARGET_OPTIONS}
              value={filter.target}
            />
            {filter.authorId === undefined ? null : (
              <FilterToggle
                icon={User}
                label={
                  author === undefined || author === null
                    ? m.comments_one_author()
                    : m.comments_by_author({ name: author.displayUsername })
                }
                onChange={() => {
                  update({ authorId: undefined })
                }}
                pressed
              />
            )}
            <FilterToggle
              icon={Trash}
              label={m.comments_only_deleted()}
              onChange={(deleted) => {
                update({ deleted })
              }}
              pressed={!live}
            />
          </FilterToolbar>
        }
      >
        {data?.data.map((comment) => (
          <ManagedCommentRow
            canDelete={live}
            comment={comment}
            key={comment.id}
            onAuthor={
              comment.author === null || comment.author.id === filter.authorId
                ? null
                : () => {
                    update({ authorId: comment.author?.id })
                  }
            }
            onDelete={() => {
              setDeleting({ comments: [comment], bulk: false })
            }}
            selection={live ? selection : undefined}
          />
        ))}
      </CatalogTable>
      <DeleteCommentsDialog
        comments={deleting?.comments ?? null}
        onClose={() => {
          setDeleting(null)
        }}
        onDone={deleting?.bulk === true ? selection.clear : undefined}
      />
    </DashboardPage>
  )
}

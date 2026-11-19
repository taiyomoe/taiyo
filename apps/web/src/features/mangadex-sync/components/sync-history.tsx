import { config } from "@taiyomoe/config"
import { History } from "@taiyomoe/ui/components/icons"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { DashboardSection } from "@/components/layout/dashboard-page"
import {
  SkeletonActions,
  SkeletonMediaCell,
  SkeletonPill,
  SkeletonText,
} from "@/features/catalog/components/shared/catalog-skeletons"
import {
  CatalogFooter,
  CatalogTable,
  VisuallyHidden,
} from "@/features/catalog/components/shared/catalog-table"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { formatNumber } from "@/features/dashboard/lib/format"
import {
  mangaDexSyncsQueryOptions,
  useCancelMangaDexSync,
} from "@/features/mangadex-sync/api/mangadex-sync"
import { SyncDetailsDialog } from "@/features/mangadex-sync/components/sync-details-dialog"
import { SyncHistoryRow } from "@/features/mangadex-sync/components/sync-history-row"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export function SyncHistory({ mediaId }: { mediaId: string }) {
  const { data } = useQuery(mangaDexSyncsQueryOptions(mediaId))
  const cancel = useCancelMangaDexSync()
  const [shownId, setShownId] = useState<string | null>(null)

  return (
    <DashboardSection
      description={m.mangadex_history_description({ count: config.mangaDex.recentSyncs })}
      title={m.mangadex_history()}
    >
      <CatalogTable
        columns={[
          {
            key: "sync",
            label: m.mangadex_column_added(),
            skeleton: <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="none" />,
          },
          {
            key: "status",
            label: m.mangadex_column_status(),
            width: catalogStyles.colMedium,
            from: "3xl",
            skeleton: <SkeletonPill />,
          },
          {
            key: "items",
            label: m.mangadex_column_items(),
            width: catalogStyles.colTarget,
            from: "4xl",
            skeleton: <SkeletonText width="9rem" />,
          },
          {
            key: "by",
            label: m.mangadex_column_by(),
            width: catalogStyles.colWide,
            from: "4xl",
            skeleton: <SkeletonText width="6rem" />,
          },
          {
            key: "date",
            label: m.mangadex_column_date(),
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
          data?.length === 0
            ? {
                icon: History,
                title: m.mangadex_history_empty_title(),
                description: m.mangadex_history_empty_description(),
              }
            : null
        }
        footer={
          data === undefined ? null : (
            <CatalogFooter total={m.catalog_results({ count: formatNumber(data.length) })}>
              {null}
            </CatalogFooter>
          )
        }
        loading={data === undefined}
        toolbar={null}
      >
        {data?.map((sync) => (
          <SyncHistoryRow
            cancelling={cancel.isPending && cancel.variables === sync.id}
            key={sync.id}
            onCancel={() => {
              cancel.mutate(sync.id, {
                onError: (error) => {
                  toastManager.add({ title: getErrorMessage(error), type: "error" })
                },
              })
            }}
            onDetails={() => {
              setShownId(sync.id)
            }}
            sync={sync}
          />
        ))}
      </CatalogTable>
      <SyncDetailsDialog
        onClose={() => {
          setShownId(null)
        }}
        sync={data?.find((sync) => sync.id === shownId) ?? null}
      />
    </DashboardSection>
  )
}

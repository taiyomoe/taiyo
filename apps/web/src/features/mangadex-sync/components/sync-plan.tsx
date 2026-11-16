import * as stylex from "@stylexjs/stylex"
import { Link } from "@taiyomoe/ui/components/icons"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { mangaDexPlanQueryOptions } from "@/features/mangadex-sync/api/mangadex-sync"
import { LinkMangaDexForm } from "@/features/mangadex-sync/components/link-mangadex-form"
import { PlanSections } from "@/features/mangadex-sync/components/plan-sections"
import { syncStyles } from "@/features/mangadex-sync/components/sync-styles"
import { MediaImagesEmpty } from "@/features/media/components/media-images-empty"
import { getApiErrorCode } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  skeleton: {
    borderRadius: "1.5rem",
    height: "9rem",
  },
})
const LINK_ERRORS = new Set(["MANGADEX_NOT_LINKED", "MANGADEX_NOT_FOUND", "MEDIA_LINK_CONFLICT"])

export function SyncPlan({
  mediaId,
  mangaDexId,
  onLink,
}: {
  mediaId: string
  mangaDexId: string | null
  onLink: (mangaDexId: string) => void
}) {
  const plan = useQuery(mangaDexPlanQueryOptions(mediaId, mangaDexId))
  const code = plan.isError ? getApiErrorCode(plan.error) : undefined

  if (plan.isPending) {
    return (
      <div aria-busy="true" sx={syncStyles.column}>
        <p sx={syncStyles.muted}>{m.mangadex_comparing()}</p>
        <Skeleton sx={styles.skeleton} />
        <Skeleton sx={styles.skeleton} />
      </div>
    )
  }

  if (plan.isError) {
    return code === "MANGADEX_NOT_LINKED" ? (
      <MediaImagesEmpty
        action={<LinkMangaDexForm onLink={onLink} />}
        description={m.mangadex_not_linked_description()}
        icon={<Link />}
        title={m.mangadex_not_linked()}
      />
    ) : (
      <div sx={syncStyles.column}>
        <ErrorAlert
          message={getErrorMessage(plan.error, {
            MANGADEX_NOT_FOUND: m.mangadex_error_not_found,
            MANGADEX_UNAVAILABLE: m.mangadex_error_unavailable,
            MANGADEX_LINK_MISMATCH: m.mangadex_error_mismatch,
            MEDIA_LINK_CONFLICT: m.mangadex_error_conflict,
            MEDIA_LOCKED: m.mangadex_error_locked,
          })}
        />
        {code !== undefined && LINK_ERRORS.has(code) ? <LinkMangaDexForm onLink={onLink} /> : null}
      </div>
    )
  }

  return (
    <PlanSections
      key={plan.dataUpdatedAt}
      mangaDexId={mangaDexId}
      mediaId={mediaId}
      onRefresh={() => {
        void plan.refetch()
      }}
      plan={plan.data}
      refreshing={plan.isFetching}
    />
  )
}

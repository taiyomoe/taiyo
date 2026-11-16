import {
  type Announcements,
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Plus, Star } from "@taiyomoe/ui/components/icons"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useQuery } from "@tanstack/react-query"
import { useId, useState } from "react"
import type { FeaturedMedia } from "@/features/site-settings/api/featured-medias"
import { PageAction } from "@/components/filters/filter-toolbar"
import { DashboardPage, DashboardSection } from "@/components/layout/dashboard-page"
import {
  SkeletonActions,
  SkeletonBanner,
  SkeletonIconText,
  SkeletonMediaCell,
  SkeletonText,
} from "@/features/catalog/components/shared/catalog-skeletons"
import {
  CatalogFooter,
  CatalogTable,
  VisuallyHidden,
} from "@/features/catalog/components/shared/catalog-table"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import {
  managedFeaturedMediasQueryOptions,
  useSetFeaturedMedias,
} from "@/features/site-settings/api/featured-medias"
import { AddFeaturedMediaDialog } from "@/features/site-settings/components/add-featured-media-dialog"
import { FeaturedMediaRow } from "@/features/site-settings/components/featured-media-row"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const MAX = config.input.maxFeaturedMedias
const styles = stylex.create({
  colHandle: { width: "3.25rem" },
  colPosition: { width: "3rem" },
})

export function SiteSettingsPage() {
  const dndId = useId()
  const { data } = useQuery(managedFeaturedMediasQueryOptions)
  const save = useSetFeaturedMedias()
  const [adding, setAdding] = useState(false)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const medias = data ?? []
  const ids = medias.map((media) => media.id)
  const position = (id: UniqueIdentifier) => ids.indexOf(String(id)) + 1
  const announcements: Announcements = {
    onDragStart: ({ active }) => m.list_editor_drag_start({ position: position(active.id) }),
    onDragOver: ({ active, over }) =>
      over === null
        ? undefined
        : m.list_editor_drag_over({ from: position(active.id), to: position(over.id) }),
    onDragEnd: ({ active, over }) =>
      over === null
        ? undefined
        : m.list_editor_drag_end({ from: position(active.id), to: position(over.id) }),
    onDragCancel: ({ active }) => m.list_editor_drag_cancel({ position: position(active.id) }),
  }
  const change = (next: FeaturedMedia[], success: string) => {
    save.mutate(next, {
      onSuccess: () => {
        toastManager.add({ title: success, type: "success" })
      },
      onError: (error) => {
        toastManager.add({ title: getErrorMessage(error), type: "error" })
      },
    })
  }

  return (
    <DashboardPage subtitle={m.site_settings_subtitle()} title={m.dashboard_nav_settings()}>
      <DashboardSection
        action={
          <PageAction
            disabled={data === undefined || medias.length >= MAX}
            onClick={() => {
              setAdding(true)
            }}
          >
            <Plus />
            {m.site_settings_add_media()}
          </PageAction>
        }
        description={m.site_settings_featured_description()}
        title={m.site_settings_featured_title()}
      >
        <DndContext
          accessibility={{
            announcements,
            screenReaderInstructions: { draggable: m.list_editor_drag_instructions() },
          }}
          collisionDetection={closestCenter}
          id={dndId}
          onDragEnd={({ active, over }) => {
            if (over !== null && active.id !== over.id) {
              change(
                arrayMove(medias, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))),
                m.site_settings_reordered(),
              )
            }
          }}
          sensors={sensors}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <CatalogTable
              columns={[
                {
                  key: "drag",
                  label: <VisuallyHidden>{m.site_settings_column_move()}</VisuallyHidden>,
                  width: styles.colHandle,
                  skeleton: <SkeletonActions />,
                },
                {
                  key: "position",
                  label: "#",
                  width: styles.colPosition,
                  skeleton: <SkeletonText width="1rem" />,
                },
                {
                  key: "media",
                  label: m.catalog_column_media(),
                  skeleton: (
                    <SkeletonMediaCell narrow={{ from: "3xl", content: "banner" }} thumb="cover" />
                  ),
                },
                {
                  key: "banner",
                  label: m.site_settings_column_banner(),
                  width: catalogStyles.colBanner,
                  from: "3xl",
                  skeleton: <SkeletonBanner />,
                },
                {
                  key: "rating",
                  label: m.catalog_column_rating(),
                  width: catalogStyles.colMedium,
                  from: "4xl",
                  skeleton: <SkeletonIconText />,
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
                      icon: Star,
                      title: m.site_settings_empty_title(),
                      description: m.site_settings_empty_description(),
                    }
                  : null
              }
              fetching={save.isPending}
              footer={
                data === undefined ? null : (
                  <CatalogFooter total={m.site_settings_count({ count: medias.length, max: MAX })}>
                    {null}
                  </CatalogFooter>
                )
              }
              loading={data === undefined}
              toolbar={null}
            >
              {medias.map((media, index) => (
                <FeaturedMediaRow
                  count={medias.length}
                  disabled={save.isPending}
                  index={index}
                  key={media.id}
                  media={media}
                  onMove={(to) => {
                    change(arrayMove(medias, index, to), m.site_settings_reordered())
                  }}
                  onRemove={() => {
                    change(
                      medias.filter((item) => item.id !== media.id),
                      m.site_settings_removed({ title: media.title ?? m.media_untitled() }),
                    )
                  }}
                />
              ))}
            </CatalogTable>
          </SortableContext>
        </DndContext>
      </DashboardSection>
      <AddFeaturedMediaDialog
        featuredIds={new Set(ids)}
        full={medias.length >= MAX}
        onAdd={(media) => {
          change(
            [
              ...medias,
              {
                id: media.id,
                title: media.title,
                coverUrl: media.coverUrl,
                bannerUrl: null,
                type: media.type,
                status: media.status,
                contentRating: media.contentRating,
                deletedAt: null,
              },
            ],
            m.site_settings_added({ title: media.title ?? m.media_untitled() }),
          )
        }}
        onClose={() => {
          setAdding(false)
        }}
        open={adding}
      />
    </DashboardPage>
  )
}

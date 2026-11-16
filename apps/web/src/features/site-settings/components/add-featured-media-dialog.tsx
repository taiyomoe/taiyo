import * as stylex from "@stylexjs/stylex"
import { Check, Plus, Search } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useDeferredValue, useState } from "react"
import type { ManagedMedia } from "@/features/catalog/api/catalog"
import { managedMediasQueryOptions } from "@/features/catalog/api/catalog"
import { SkeletonMediaCell } from "@/features/catalog/components/shared/catalog-skeletons"
import { MediaCell } from "@/features/catalog/components/shared/media-cell"
import { MEDIA_TYPE_LABELS } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  body: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  results: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    minHeight: "12rem",
  },
  result: {
    gap: "0.75rem",
    paddingBlock: "0.5rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    borderTopColor: colors.border,
    borderTopStyle: { default: "solid", ":first-child": "none" },
    borderTopWidth: 1,
  },
  media: {
    // Long titles truncate instead of widening the dialog past its buttons.
    contain: "inline-size",
    flexGrow: 1,
    minWidth: 0,
  },
  empty: {
    paddingBlock: "2rem",
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    textAlign: "center",
  },
})

export function AddFeaturedMediaDialog({
  open,
  featuredIds,
  full,
  onAdd,
  onClose,
}: {
  open: boolean
  featuredIds: ReadonlySet<string>
  full: boolean
  onAdd: (media: ManagedMedia) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState("")
  const query = useDeferredValue(search.trim())
  const { data, isPending } = useQuery({
    ...managedMediasQueryOptions({ search: query === "" ? undefined : query, page: 1 }),
    enabled: open,
  })

  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) {
          setSearch("")
          onClose()
        }
      }}
      open={open}
    >
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{m.site_settings_add_title()}</DialogTitle>
          <DialogDescription>
            {full ? m.site_settings_add_full() : m.site_settings_add_description()}
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div sx={styles.body}>
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                aria-label={m.catalog_media_search()}
                autoFocus
                onChange={(event) => {
                  setSearch(event.target.value)
                }}
                placeholder={m.catalog_media_search()}
                type="search"
                value={search}
              />
            </InputGroup>
            <ul aria-busy={isPending} sx={styles.results}>
              {isPending
                ? Array.from({ length: 5 }, (_, index) => (
                    <li key={index} sx={styles.result}>
                      <SkeletonMediaCell thumb="cover" />
                    </li>
                  ))
                : null}
              {data?.data.length === 0 ? (
                <li sx={styles.empty}>{m.catalog_media_empty_title()}</li>
              ) : null}
              {data?.data.map((media) => {
                const featured = featuredIds.has(media.id)

                return (
                  <li key={media.id} sx={styles.result}>
                    <div sx={styles.media}>
                      <MediaCell
                        coverUrl={media.coverUrl}
                        detail={MEDIA_TYPE_LABELS[media.type]()}
                        mediaId={media.id}
                        title={media.title}
                      />
                    </div>
                    <Button
                      disabled={featured || full}
                      onClick={() => {
                        onAdd(media)
                      }}
                      size="sm"
                      variant={featured ? "ghost" : "outline"}
                    >
                      {featured ? <Check /> : <Plus />}
                      {featured ? m.site_settings_featured() : m.site_settings_add()}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </div>
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  )
}

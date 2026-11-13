// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@taiyomoe/ui/components/ui/combobox"
import { useQuery } from "@tanstack/react-query"
import { useDeferredValue, useState } from "react"
import type { MediaEditRelation } from "@/features/media-suggestions/lib/media-edit-model"
import { fieldEditorStyles } from "@/features/media-suggestions/components/field-editors/field-editor-styles"
import { searchMediasQueryOptions } from "@/features/media/api/medias"
import { getOptionSynopsis, MediaOptionContent } from "@/features/media/components/media-option"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

type MediaOption = Omit<MediaEditRelation, "type"> & { synopsis: string }

export function RelatedMediaPicker({
  excludedIds,
  onPick,
}: {
  excludedIds: ReadonlySet<string>
  onPick: (media: Omit<MediaEditRelation, "type">) => void
}) {
  const { contentRatings } = useSettings()
  const [input, setInput] = useState("")
  const query = useDeferredValue(input.trim())
  const results = useQuery({
    ...searchMediasQueryOptions({
      q: query,
      page: 1,
      perPage: 10,
      filter: { contentRating: { in: [...contentRatings] } },
    }),
    enabled: query.length > 0,
  })
  const options = (results.data?.data ?? []).flatMap((hit) =>
    excludedIds.has(hit.id)
      ? []
      : [
          {
            mediaId: hit.id,
            title: hit.mainTitle?.title ?? null,
            coverUrl: hit.coverUrl,
            synopsis: getOptionSynopsis(hit.synopsis),
          } satisfies MediaOption,
        ],
  )

  return (
    <div sx={fieldEditorStyles.addPicker}>
      <Combobox<MediaOption>
        filter={null}
        inputValue={input}
        isItemEqualToValue={(a, b) => a.mediaId === b.mediaId}
        itemToStringLabel={(item) => item.title ?? ""}
        items={options}
        onInputValueChange={setInput}
        onValueChange={(next) => {
          if (next !== null) {
            onPick({ mediaId: next.mediaId, title: next.title, coverUrl: next.coverUrl })
            setInput("")
          }
        }}
        value={null}
      >
        <ComboboxInput placeholder={m.media_edit_relation_search()} size="sm" />
        <ComboboxPopup>
          <ComboboxList>
            {(item: MediaOption) => (
              <ComboboxItem key={item.mediaId} value={item}>
                <MediaOptionContent
                  coverUrl={item.coverUrl}
                  synopsis={item.synopsis}
                  title={item.title ?? m.media_untitled()}
                />
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>
            {results.isFetching ? m.upload_searching() : m.media_edit_relation_none()}
          </ComboboxEmpty>
        </ComboboxPopup>
      </Combobox>
    </div>
  )
}

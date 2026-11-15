import * as stylex from "@stylexjs/stylex"
import { Check } from "@taiyomoe/ui/components/icons"
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@taiyomoe/ui/components/ui/combobox"
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useDeferredValue, useState } from "react"
import type { EditorTitle } from "@/features/lists/lib/list-editor"
import { searchMediasQueryOptions } from "@/features/media/api/medias"
import { getOptionSynopsis, MediaOptionContent } from "@/features/media/components/media-option"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

type TitleOption = EditorTitle & { synopsis: string }

const styles = stylex.create({
  added: {
    gap: "0.25rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "inline-flex",
    flexShrink: 0,
    fontSize: "0.75rem",
  },
})

export function TitleSearch({
  selectedIds,
  disabled,
  onAdd,
}: {
  selectedIds: ReadonlySet<string>
  disabled: boolean
  onAdd: (title: EditorTitle) => void
}) {
  const { contentRatings } = useSettings()
  const [search, setSearch] = useState("")
  const query = useDeferredValue(search.trim())
  const results = useQuery({
    ...searchMediasQueryOptions({
      q: query,
      page: 1,
      perPage: 10,
      filter: { contentRating: { in: [...contentRatings] } },
    }),
    enabled: query.length > 0,
  })
  const options: TitleOption[] = (results.data?.data ?? []).map((hit) => ({
    mediaId: hit.id,
    title: hit.mainTitle?.title ?? null,
    coverUrl: hit.coverUrl,
    type: hit.type,
    synopsis: getOptionSynopsis(hit.synopsis),
  }))
  let emptyMessage = results.isFetching ? m.list_editor_searching() : m.list_editor_search_empty()

  if (query.length === 0) {
    emptyMessage = m.list_editor_search_hint()
  }

  return (
    <Field
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault()
        }
      }}
    >
      <FieldLabel>{m.list_editor_search_label()}</FieldLabel>
      <Combobox<TitleOption>
        disabled={disabled}
        filter={null}
        inputValue={search}
        isItemEqualToValue={(a, b) => a.mediaId === b.mediaId}
        itemToStringLabel={(item) => item.title ?? ""}
        items={options}
        onInputValueChange={setSearch}
        onValueChange={(item) => {
          if (item !== null && !selectedIds.has(item.mediaId)) {
            onAdd({
              mediaId: item.mediaId,
              title: item.title,
              coverUrl: item.coverUrl,
              type: item.type,
            })
          }

          setSearch("")
        }}
        value={null}
      >
        <ComboboxInput placeholder={m.list_editor_search_placeholder()} />
        <ComboboxPopup>
          <ComboboxList>
            {(item: TitleOption) => (
              <ComboboxItem
                disabled={selectedIds.has(item.mediaId)}
                key={item.mediaId}
                value={item}
              >
                <MediaOptionContent
                  coverUrl={item.coverUrl}
                  synopsis={item.synopsis}
                  title={item.title ?? m.media_untitled()}
                >
                  {selectedIds.has(item.mediaId) ? (
                    <span sx={styles.added}>
                      <Check />
                      {m.list_editor_already_added()}
                    </span>
                  ) : null}
                </MediaOptionContent>
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        </ComboboxPopup>
      </Combobox>
    </Field>
  )
}

import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@taiyomoe/ui/components/ui/combobox"
import { Field, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { useQuery } from "@tanstack/react-query"
import { useDeferredValue, useState } from "react"
import { searchMediasQueryOptions } from "@/features/media/api/medias"
import { getOptionSynopsis, MediaOptionContent } from "@/features/media/components/media-option"
import { m } from "@/paraglide/messages"

export type MediaOption = { id: string; title: string; coverUrl: string | null; synopsis: string }

export function MediaField({
  invalid,
  value: media,
  onChange,
}: {
  invalid: boolean
  value: MediaOption | null
  onChange: (media: MediaOption | null) => void
}) {
  const [mediaSearch, setMediaSearch] = useState(media?.title ?? "")
  const mediaQuery = useDeferredValue(mediaSearch.trim())
  const mediaResults = useQuery({
    ...searchMediasQueryOptions({ q: mediaQuery, page: 1, perPage: 10 }),
    enabled: mediaQuery.length > 0,
  })
  const mediaOptions: MediaOption[] = (mediaResults.data?.data ?? []).flatMap((hit) =>
    hit.mainTitle === null
      ? []
      : [
          {
            id: hit.id,
            title: hit.mainTitle.title,
            coverUrl: hit.coverUrl,
            synopsis: getOptionSynopsis(hit.synopsis),
          },
        ],
  )
  let mediaEmptyMessage = mediaResults.isFetching ? m.upload_searching() : m.upload_media_empty()

  if (mediaQuery.length === 0) {
    mediaEmptyMessage = m.upload_media_hint()
  }

  return (
    <Field invalid={invalid}>
      <FieldLabel>{m.upload_media()}</FieldLabel>
      <Combobox<MediaOption>
        filter={null}
        inputValue={mediaSearch}
        isItemEqualToValue={(a, b) => a.id === b.id}
        itemToStringLabel={(item) => item.title}
        items={
          media === null || mediaOptions.some((item) => item.id === media.id)
            ? mediaOptions
            : [media, ...mediaOptions]
        }
        onInputValueChange={setMediaSearch}
        onValueChange={onChange}
        value={media}
      >
        <ComboboxInput
          aria-invalid={invalid || undefined}
          placeholder={m.upload_media_placeholder()}
        />
        <ComboboxPopup>
          <ComboboxList>
            {(item: MediaOption) => (
              <ComboboxItem key={item.id} value={item}>
                <MediaOptionContent
                  coverUrl={item.coverUrl}
                  synopsis={item.synopsis}
                  title={item.title}
                />
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>{mediaEmptyMessage}</ComboboxEmpty>
        </ComboboxPopup>
      </Combobox>
      {invalid ? <FieldError match>{m.upload_media_required()}</FieldError> : null}
    </Field>
  )
}

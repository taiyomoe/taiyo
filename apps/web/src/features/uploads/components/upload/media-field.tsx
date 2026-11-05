import * as stylex from "@stylexjs/stylex"
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@taiyomoe/ui/components/ui/combobox"
import { Field, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useDeferredValue, useState } from "react"
import { getRichTextParagraphs, parseRichText } from "@/components/rich-text/rich-text-document"
import { searchMediasQueryOptions } from "@/features/media/api/medias"
import { Cover } from "@/features/media/components/cover"
import { getSynopsis } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

export type MediaOption = { id: string; title: string; coverUrl: string | null; synopsis: string }

const styles = stylex.create({
  option: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
    width: "100%",
  },
  cover: {
    borderRadius: radius.md,
    width: "2.5rem",
  },
  optionText: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  optionTitle: {
    overflow: "hidden",
    fontWeight: 500,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  optionSynopsis: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    color: colors.mutedForeground,
    display: "-webkit-box",
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },
})

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
            synopsis: (
              getRichTextParagraphs(parseRichText(getSynopsis(hit.synopsis)))[0] ?? ""
            ).replace(/\s+/g, " "),
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
                <span sx={styles.option}>
                  <Cover src={item.coverUrl} sx={styles.cover} />
                  <span sx={styles.optionText}>
                    <span sx={styles.optionTitle}>{item.title}</span>
                    {item.synopsis === "" ? null : (
                      <span sx={styles.optionSynopsis}>{item.synopsis}</span>
                    )}
                  </span>
                </span>
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

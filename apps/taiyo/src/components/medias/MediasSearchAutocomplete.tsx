import { Autocomplete, AutocompleteItem } from "@nextui-org/autocomplete"
import { useAsyncList } from "@react-stately/data"
import type { Key } from "@react-types/shared"
import type { InsertMediaChapterFormSchema } from "@taiyomoe/schemas"
import type { SearchedMedia } from "@taiyomoe/types"
import { useFormikContext } from "formik"
import { parseAsString, useQueryState } from "next-usequerystate"
import { useEffect } from "react"
import { z } from "zod"
import { api } from "~/trpc/react"

export const MediasSearchAutocomplete = () => {
  const [mediaId] = useQueryState("mediaId", parseAsString.withDefault(""))
  const { setFieldValue } = useFormikContext<InsertMediaChapterFormSchema>()
  const { mutateAsync } = api.medias.search.useMutation()

  const list = useAsyncList<SearchedMedia>({
    load: async ({ filterText }) => {
      if (!filterText) return { items: [] }

      const data = await mutateAsync({ title: filterText })

      // This is a hack to make the autocomplete work with the mediaId query param
      if (z.string().uuid().safeParse(filterText).success && data.length > 0) {
        void setFieldValue("mediaId", filterText)

        return {
          items: data,
          filterText: data.at(0)?.title ?? "",
          selectedKeys: [filterText],
        }
      }

      return {
        items: data,
      }
    },
  })

  const handleSelectionChange = (key: Key) => {
    const item = list.getItem(key)

    if (!item) return

    void setFieldValue("mediaId", item.id)
    list.setFilterText(item.title)
    list.removeSelectedItems()
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: this should only run when mediaId changes
  useEffect(() => {
    list.setFilterText(mediaId)
  }, [mediaId])

  return (
    <Autocomplete<SearchedMedia>
      inputProps={{
        classNames: {
          mainWrapper: "w-full",
          label: "z-0 min-w-[100px] mr-6",
        },
      }}
      inputValue={list.filterText}
      isLoading={list.isLoading}
      items={list.items}
      onInputChange={list.setFilterText}
      onSelectionChange={handleSelectionChange}
      // @ts-expect-error see https://github.com/nextui-org/nextui/issues/2074#issuecomment-1880250267
      onKeyDown={(e) => e.continuePropagation()}
      placeholder="Pesquisar..."
      label="Obra"
      labelPlacement="outside-left"
      isDisabled={!!mediaId}
      fullWidth
    >
      {(item) => (
        <AutocompleteItem key={item.id}>{item.title}</AutocompleteItem>
      )}
    </Autocomplete>
  )
}

import { Autocomplete, AutocompleteItem } from "@nextui-org/autocomplete"
import { useAsyncList } from "@react-stately/data"
import type { Key } from "@react-types/shared"
import { useFormikContext } from "formik"

import type { InsertMediaChapterFormSchema } from "~/lib/schemas"
import { api } from "~/lib/trpc/client"
import type { SearchedMedia } from "~/lib/types"

export const MediasSearchAutocomplete = () => {
  const { setFieldValue } = useFormikContext<InsertMediaChapterFormSchema>()
  const { mutateAsync } = api.medias.search.useMutation()

  const list = useAsyncList<SearchedMedia>({
    load: async ({ filterText }) => {
      if (!filterText) return { items: [] }

      const data = await mutateAsync({ title: filterText })

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
      placeholder="Pesquisar..."
      label="Obra"
      labelPlacement="outside-left"
      fullWidth
    >
      {(item) => (
        <AutocompleteItem key={item.id}>{item.title}</AutocompleteItem>
      )}
    </Autocomplete>
  )
}

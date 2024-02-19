import { Autocomplete, AutocompleteItem } from "@nextui-org/autocomplete"
import { Chip } from "@nextui-org/chip"
import { tv } from "@nextui-org/react"
import type { Scan } from "@prisma/client"
import { useAsyncList } from "@react-stately/data"
import type { Key } from "@react-types/shared"
import type { ScansIndexItem } from "@taiyomoe/types"
import { useFormikContext } from "formik"
import { useCallback, useEffect, useState } from "react"
import { api } from "~/lib/trpc/client"

const scansFormField = tv({
  slots: {
    container: "flex flex-col gap-4 w-full",
    chipsContainer: "flex flex-wrap gap-2",
    label: "z-0",
  },
})

type Props = {
  name?: string
  scans?: Scan[]
}

export const ScansFormField = ({ name = "scanIds", scans }: Props) => {
  const { values, setFieldValue } = useFormikContext<{ scanIds: string[] }>()
  const { mutateAsync } = api.scans.search.useMutation()
  const [selectedItems, setSelectedItems] = useState<ScansIndexItem[]>(
    values.scanIds
      ?.map((id) => scans?.find((scan) => scan.id === id))
      .filter(Boolean) ?? [],
  )

  const { container, chipsContainer, label } = scansFormField()

  const list = useAsyncList<ScansIndexItem>({
    load: async ({ filterText }) => {
      if (!filterText) return { items: [] }

      const data = await mutateAsync(filterText)

      return {
        items: data,
      }
    },
  })

  const handleClose = (key: Key) => () => {
    setSelectedItems((prev) => {
      const newSelectedItems = prev.filter((item) => item.id !== key)

      return newSelectedItems
    })
  }

  const handleSelectionChange = useCallback(
    (key: Key) => {
      const item = list.getItem(key)

      if (!item) return

      setSelectedItems((prev) => {
        if (prev.some((prevItem) => prevItem.id === item.id)) return prev

        const newSelectedItems = [...prev, item]

        return newSelectedItems
      })

      list.setFilterText("")
      list.removeSelectedItems()
    },
    [list],
  )

  useEffect(() => {
    void setFieldValue(
      name,
      selectedItems.map((item) => item.id),
    )
  }, [name, selectedItems, setFieldValue])

  return (
    <div className={container()}>
      <Autocomplete<ScansIndexItem>
        inputProps={{
          classNames: { label: label() },
        }}
        inputValue={list.filterText}
        isLoading={list.isLoading}
        items={list.items}
        onInputChange={list.setFilterText}
        onSelectionChange={handleSelectionChange}
        placeholder="Pesquisar..."
        label="Scans"
        labelPlacement="outside"
      >
        {(item) => (
          <AutocompleteItem key={item.id}>{item.name}</AutocompleteItem>
        )}
      </Autocomplete>
      <div className={chipsContainer()}>
        {selectedItems.map((item) => (
          <Chip key={item.id} onClose={handleClose(item.id)}>
            {item.name}
          </Chip>
        ))}
      </div>
    </div>
  )
}

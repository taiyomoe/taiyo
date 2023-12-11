import { useState } from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/autocomplete";
import { Chip } from "@nextui-org/chip";
import { useAsyncList } from "@react-stately/data";
import type { Key } from "@react-types/shared";
import { useFormikContext } from "formik";

import type { InsertMediaChapterSchema } from "~/lib/schemas";
import { api } from "~/lib/trpc/client";
import type { ScansIndexItem } from "~/lib/types";

export const ScansSearchAutocomplete = () => {
  const { setFieldValue } = useFormikContext<InsertMediaChapterSchema>();
  const { mutateAsync } = api.scans.search.useMutation();
  const [selectedItems, setSelectedItems] = useState<ScansIndexItem[]>([]);

  const list = useAsyncList<ScansIndexItem>({
    load: async ({ filterText }) => {
      if (!filterText) return { items: [] };

      const data = await mutateAsync(filterText);

      return {
        items: data,
      };
    },
  });

  const handleClose = (key: Key) => () => {
    setSelectedItems((prev) => {
      const newSelectedItems = prev.filter((item) => item.id !== key);

      void setFieldValue(
        "scansIds",
        newSelectedItems.map((item) => item.id),
      );
      return newSelectedItems;
    });
  };

  const handleSelectionChange = (key: Key) => {
    const item = list.getItem(key);

    if (!item) return;

    setSelectedItems((prev) => {
      if (prev.some((prevItem) => prevItem.id === item.id)) return prev;

      const newSelectedItems = [...prev, item];

      void setFieldValue(
        "scansIds",
        newSelectedItems.map((item) => item.id),
      );
      return newSelectedItems;
    });
    list.setFilterText("");
    list.removeSelectedItems();
  };

  return (
    <div className="flex flex-col gap-4">
      <Autocomplete<ScansIndexItem>
        inputValue={list.filterText}
        isLoading={list.isLoading}
        items={list.items}
        // eslint-disable-next-line @typescript-eslint/unbound-method
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
      <div className="flex flex-wrap gap-2">
        {selectedItems.map((item) => (
          <Chip key={item.id} onClose={handleClose(item.id)}>
            {item.name}
          </Chip>
        ))}
      </div>
    </div>
  );
};

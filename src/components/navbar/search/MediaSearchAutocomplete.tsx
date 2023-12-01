import Image from "next/image";
import Link from "next/link";
import { Autocomplete, AutocompleteItem } from "@nextui-org/autocomplete";
import { useAsyncList } from "@react-stately/data";
import { SearchIcon } from "lucide-react";

import { api } from "~/lib/trpc/client";
import type { SearchedMedia } from "~/lib/types";
import { MediaUtils } from "~/lib/utils/media.utils";

export const MediaSearchAutocomplete = () => {
  const { mutateAsync } = api.medias.search.useMutation();

  const list = useAsyncList<SearchedMedia>({
    load: async ({ filterText }) => {
      if (!filterText) return { items: [] };

      const data = await mutateAsync({ title: filterText });

      return {
        items: data,
      };
    },
  });

  return (
    <Autocomplete<SearchedMedia>
      inputProps={{
        classNames: {
          input: "text-base",
          inputWrapper: "h-[40px]",
        },
      }}
      listboxProps={{
        hideSelectedIcon: true,
        classNames: {
          list: "gap-2",
        },
      }}
      popoverProps={{
        placement: "bottom",
      }}
      inputValue={list.filterText}
      isLoading={list.isLoading}
      items={list.items}
      placeholder="Pesquisar..."
      // eslint-disable-next-line @typescript-eslint/unbound-method
      onInputChange={list.setFilterText}
      startContent={<SearchIcon className="text-default-500" />}
      aria-label="search media"
      radius="full"
      className="md:w-[350px] lg:w-[400px]"
    >
      {(item) => (
        <AutocompleteItem
          key={item.id}
          as={Link}
          href={MediaUtils.getUrl(item)}
          classNames={{
            base: "p-0",
            title: "flex gap-2 h-[80px] text-ellipsis",
          }}
          textValue={item.title}
        >
          <Image
            src={MediaUtils.getCoverUrl({
              id: item.id,
              coverId: item.coverId,
            })}
            className="h-full min-w-[60px] rounded-small object-fill"
            width={60}
            height={80}
            alt="media's cover"
          />
          <div className="h-full gap-1">
            <h3 className="line-clamp-1 text-lg font-semibold">{item.title}</h3>
            <p className="line-clamp-2 text-clip text-default-500">
              {item.synopsis}
            </p>
          </div>
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
};

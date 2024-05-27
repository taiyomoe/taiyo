import type { MediaType } from "@taiyomoe/db"
import { TYPES_PT } from "@taiyomoe/utils/i18n"
import { CommandGroup } from "cmdk"
import { useRefinementList } from "react-instantsearch"
import { ToggleButton } from "~/components/generics/buttons/toggle-button"

export const MediasSearchTypes = () => {
  const { items, refine } = useRefinementList({ attribute: "type" })

  return (
    <CommandGroup
      className="w-full select-none uppercase sm:w-1/5 [&>div:first-child]:text-[0.8rem] [&>div:first-child]:text-default-400"
      heading={
        <p className="text-[0.8rem] text-default-400 uppercase">Tipos</p>
      }
      forceMount
    >
      <div className="mt-2 flex flex-col gap-1">
        {items
          .filter((item) => item.value !== "OTHER")
          .map((item) => (
            <ToggleButton
              key={item.value}
              isSelected={item.isRefined}
              onPress={() => refine(item.value)}
            >
              {TYPES_PT[item.value as MediaType]}
            </ToggleButton>
          ))}
      </div>
    </CommandGroup>
  )
}

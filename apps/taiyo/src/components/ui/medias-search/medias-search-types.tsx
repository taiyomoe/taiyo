import { CommandGroup } from "cmdk"
import { ToggleButton } from "~/components/generics/buttons/toggle-button"

export const MediasSearchTypes = () => (
  <CommandGroup
    className="w-full select-none uppercase sm:w-1/5 [&>div:first-child]:text-[0.8rem] [&>div:first-child]:text-default-400"
    heading={<p className="text-[0.8rem] text-default-400 uppercase">Tipos</p>}
    forceMount
  >
    <div className="mt-2 flex flex-col gap-1">
      <ToggleButton>Mangás</ToggleButton>
      <ToggleButton>Manhwas</ToggleButton>
      <ToggleButton>Manhuas</ToggleButton>
    </div>
  </CommandGroup>
)

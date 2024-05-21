import { CommandGroup } from "cmdk"
import { ToggleButton } from "~/components/generics/buttons/toggle-button"

export const MediasSearchTypes = () => (
  <CommandGroup
    heading="Tipos"
    className="w-1/5 select-none uppercase [&>div:first-child]:text-[0.8rem] [&>div:first-child]:text-default-400"
  >
    <div className="mt-2 flex flex-col gap-1">
      <ToggleButton>Mangás</ToggleButton>
      <ToggleButton>Manhwas</ToggleButton>
      <ToggleButton>Manhuas</ToggleButton>
    </div>
  </CommandGroup>
)

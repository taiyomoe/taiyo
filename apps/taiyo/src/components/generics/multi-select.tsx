"use client"

import { Button } from "@nextui-org/button"
import { ChevronDownIcon } from "lucide-react"
import { omit } from "radash"
import Select, {
  components,
  type ControlProps,
  type MultiValueRemoveProps,
  type Props as SelectProps,
  type MultiValueProps,
  type MultiValueGenericProps,
  type ClearIndicatorProps,
  type DropdownIndicatorProps,
  type IndicatorSeparatorProps,
  type MenuListProps,
  type MenuProps,
  type OptionProps,
  type InputProps,
  type ValueContainerProps,
  type GroupBase,
  type ContainerProps,
  type PlaceholderProps,
  type IndicatorsContainerProps,
} from "react-select"
import SelectAsync, { type AsyncProps } from "react-select/async"
import type { SelectItem } from "~/lib/types"
import { cn } from "~/lib/utils/cn"

export type MultiSelectProps<T extends SelectItem = SelectItem> = Omit<
  SelectProps<T, true>,
  "isMulti" | "menuPlacement" | "noOptionsMessage" | "components"
>

const SelectContainer = <T,>(props: ContainerProps<T, true>) => (
  <components.SelectContainer {...props} className="w-full min-w-52" />
)

const Control = <T,>(props: ControlProps<T, true>) => (
  <components.Control
    {...props}
    className={cn(
      "!bg-default-100 !transition-background !duration-150 !rounded-medium !border-none !ring-0 hover:!cursor-text !min-h-10 !motion-reduce:transition-none",
      { "hover:!bg-default-200": !props.isFocused },
    )}
  />
)

const Input = <T,>(props: InputProps<T, true>) => (
  <components.Input
    {...props}
    className="!p-0 !m-0 !text-default-foreground !text-small"
  />
)

const Placeholder = <T,>(props: PlaceholderProps<T, true>) => (
  <components.Placeholder
    {...props}
    className="!m-0 !text-foreground-500 !text-small"
  />
)

const IndicatorsContainer = <T,>(props: IndicatorsContainerProps<T, true>) => (
  <components.IndicatorsContainer {...props} className="[&>div]:!p-0 pr-1" />
)

const ClearIndicator = <T,>(props: ClearIndicatorProps<T, true>) => (
  <components.ClearIndicator
    {...props}
    className="!text-default-400 child:hover:!text-default-600 hover:cursor-pointer"
  />
)

const DropdownIndicator = <T,>(props: DropdownIndicatorProps<T, true>) => (
  <components.DropdownIndicator {...props}>
    <Button
      startContent={<ChevronDownIcon size={16} />}
      variant="light"
      radius="full"
      size="sm"
      isIconOnly
    />
  </components.DropdownIndicator>
)

const IndicatorSeparator = <T,>(props: IndicatorSeparatorProps<T, true>) => (
  <components.IndicatorSeparator {...props} className="hidden" />
)

const MultiValue = <T,>(props: MultiValueProps<T, true>) => (
  <components.MultiValue
    {...props}
    innerProps={{
      // @ts-expect-error `css` is in fact a prop
      ...omit(props.innerProps, ["css"]),
      className:
        "!bg-default-400 !rounded-md px-1.5 py-0.5 !m-0 flex gap-2 items-center",
    }}
  />
)

const ValueContainer = <T,>(props: ValueContainerProps<T, true>) => (
  <components.ValueContainer {...props} className="!px-3 !py-2 gap-1" />
)

const MultiValueLabel = <T,>(props: MultiValueGenericProps<T, true>) => (
  <components.MultiValueLabel
    {...props}
    // @ts-expect-error `css` is in fact a prop
    innerProps={{ ...omit(props.innerProps, ["css"]), className: "text-small" }}
  />
)

const MultiValueRemove = <T,>(props: MultiValueRemoveProps<T, true>) => (
  <components.MultiValueRemove
    {...props}
    innerProps={{
      // @ts-expect-error `css` is in fact a prop
      ...omit(props.innerProps, ["css"]),
      className:
        "hover:bg-default-600 rounded-full size-4 transition-colors child:hover:text-default-200 child:transition-colors flex items-center justify-center",
    }}
  />
)

const Menu = <T,>(props: MenuProps<T, true>) => (
  <components.Menu
    {...props}
    className={cn("!z-20 !bg-content1 !rounded-large !my-[5px]")}
  />
)

const MenuList = <T,>(props: MenuListProps<T, true>) => (
  <components.MenuList
    {...props}
    className="!p-2 scrollbar-thin scrollbar-track-content2 scrollbar-thumb-primary"
  />
)

const Option = <T,>(props: OptionProps<T, true>) => (
  <components.Option
    {...props}
    className={cn("truncate rounded-medium font-normal text-small", {
      "!bg-default": props.isFocused,
    })}
  />
)

export const MultiSelect = <T extends SelectItem>(
  props: MultiSelectProps<T>,
) => {
  return (
    <Select
      isMulti
      menuPlacement="auto"
      noOptionsMessage={() => "Nenhum resultado encontrado"}
      placeholder="Pesquisar..."
      closeMenuOnSelect={false}
      components={{
        SelectContainer,
        Control,
        Input,
        Placeholder,
        IndicatorsContainer,
        ClearIndicator,
        DropdownIndicator,
        IndicatorSeparator,
        ValueContainer,
        MultiValue,
        MultiValueLabel,
        MultiValueRemove,
        Menu,
        MenuList,
        Option,
      }}
      menuPortalTarget={document?.body}
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 10000 }) }}
      {...props}
    />
  )
}

export const MultiSelectAsync = <T extends SelectItem>(
  props: AsyncProps<T, true, GroupBase<T>>,
) => {
  return (
    <SelectAsync
      isMulti
      cacheOptions
      menuPlacement="auto"
      noOptionsMessage={() => "Nenhum resultado encontrado"}
      placeholder="Pesquisar..."
      closeMenuOnSelect={false}
      components={{
        SelectContainer,
        Control,
        Input,
        Placeholder,
        IndicatorsContainer,
        ClearIndicator,
        DropdownIndicator,
        IndicatorSeparator,
        ValueContainer,
        MultiValue,
        MultiValueLabel,
        MultiValueRemove,
        Menu,
        MenuList,
        Option,
      }}
      menuPortalTarget={document?.body}
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 10000 }) }}
      {...props}
    />
  )
}

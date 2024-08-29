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
    className="!bg-default-100 hover:!bg-default-200 !transition-background !duration-150 !rounded-medium !border-none !ring-0 hover:!cursor-text !min-h-10 !motion-reduce:transition-none"
  />
)

const Input = <T,>(props: InputProps<T, true>) => (
  <components.Input
    {...props}
    className="!p-0 !m-0 !text-content1-foreground"
  />
)

const ClearIndicator = <T,>(props: ClearIndicatorProps<T, true>) => (
  <components.ClearIndicator
    {...props}
    className="!text-default-400 child:hover:!text-default-600 hover:cursor-pointer"
  />
)

const DropdownIndicator = <T,>(props: DropdownIndicatorProps<T, true>) => (
  <components.DropdownIndicator
    {...props}
    className="!text-default-400 child:hover:!text-default-600 hover:cursor-pointer"
  />
)

const IndicatorSeparator = <T,>(props: IndicatorSeparatorProps<T, true>) => (
  <components.IndicatorSeparator {...props} className="!bg-default-400" />
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
  <components.ValueContainer {...props} className="!p-2 gap-1" />
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
    className={cn("!z-20 !bg-content1 !rounded-large")}
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
      closeMenuOnSelect={false}
      components={{
        SelectContainer,
        Control,
        Input,
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
      menuPortalTarget={document.body}
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
      closeMenuOnSelect={false}
      components={{
        SelectContainer,
        Control,
        Input,
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
      menuPortalTarget={document.body}
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 10000 }) }}
      {...props}
    />
  )
}

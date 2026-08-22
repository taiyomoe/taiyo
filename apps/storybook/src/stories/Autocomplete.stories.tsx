import preview from "@/storybook/preview"
import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
  AutocompleteSeparator,
} from "@taiyomoe/ui/components/ui/autocomplete"
import { SearchIcon } from "lucide-react"
import { Fragment } from "react"
import { fn } from "storybook/test"

type Fruit = { value: string; label: string }

const fruits: Fruit[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Blueberry" },
  { value: "cherry", label: "Cherry" },
  { value: "grape", label: "Grape" },
  { value: "lemon", label: "Lemon" },
  { value: "mango", label: "Mango" },
  { value: "orange", label: "Orange" },
  { value: "peach", label: "Peach" },
  { value: "pear", label: "Pear" },
  { value: "pineapple", label: "Pineapple" },
  { value: "strawberry", label: "Strawberry" },
  { value: "watermelon", label: "Watermelon" },
]
const meta = preview.meta({
  title: "UI/Autocomplete",
  component: Autocomplete,
  subcomponents: {
    AutocompleteInput,
    AutocompletePopup,
    AutocompleteList,
    AutocompleteItem,
    AutocompleteGroup,
    AutocompleteGroupLabel,
    AutocompleteSeparator,
    AutocompleteEmpty,
  },
  parameters: { layout: "centered" },
  args: { onValueChange: fn(), onOpenChange: fn() },
})

export const Default = meta.story({
  render: () => (
    <div className="w-72">
      <Autocomplete items={fruits}>
        <AutocompleteInput placeholder="Search fruits..." />
        <AutocompletePopup>
          <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
          <AutocompleteList>
            {(item: Fruit) => (
              <AutocompleteItem key={item.value} value={item}>
                {item.label}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>
    </div>
  ),
})

export const Sizes = meta.story({
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Autocomplete items={fruits}>
        <AutocompleteInput placeholder="Search fruits..." size="sm" />
        <AutocompletePopup>
          <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
          <AutocompleteList>
            {(item: Fruit) => (
              <AutocompleteItem key={item.value} value={item}>
                {item.label}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>
      <Autocomplete items={fruits}>
        <AutocompleteInput placeholder="Search fruits..." size="default" />
        <AutocompletePopup>
          <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
          <AutocompleteList>
            {(item: Fruit) => (
              <AutocompleteItem key={item.value} value={item}>
                {item.label}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>
      <Autocomplete items={fruits}>
        <AutocompleteInput placeholder="Search fruits..." size="lg" />
        <AutocompletePopup>
          <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
          <AutocompleteList>
            {(item: Fruit) => (
              <AutocompleteItem key={item.value} value={item}>
                {item.label}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>
    </div>
  ),
})

export const WithTrigger = meta.story({
  render: () => (
    <div className="w-72">
      <Autocomplete items={fruits} openOnInputClick>
        <AutocompleteInput placeholder="Search fruits..." showTrigger />
        <AutocompletePopup>
          <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
          <AutocompleteList>
            {(item: Fruit) => (
              <AutocompleteItem key={item.value} value={item}>
                {item.label}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>
    </div>
  ),
})

export const WithClear = meta.story({
  render: () => (
    <div className="w-72">
      <Autocomplete defaultValue="Apple" items={fruits}>
        <AutocompleteInput placeholder="Search fruits..." showClear />
        <AutocompletePopup>
          <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
          <AutocompleteList>
            {(item: Fruit) => (
              <AutocompleteItem key={item.value} value={item}>
                {item.label}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>
    </div>
  ),
})

export const WithStartAddon = meta.story({
  render: () => (
    <div className="w-72">
      <Autocomplete items={fruits}>
        <AutocompleteInput placeholder="Search fruits..." startAddon={<SearchIcon />} />
        <AutocompletePopup>
          <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
          <AutocompleteList>
            {(item: Fruit) => (
              <AutocompleteItem key={item.value} value={item}>
                {item.label}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>
    </div>
  ),
})

export const Disabled = meta.story({
  render: () => (
    <div className="w-72">
      <Autocomplete disabled items={fruits}>
        <AutocompleteInput placeholder="Search fruits..." />
        <AutocompletePopup>
          <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
          <AutocompleteList>
            {(item: Fruit) => (
              <AutocompleteItem key={item.value} value={item}>
                {item.label}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>
    </div>
  ),
})

export const ReadOnly = meta.story({
  render: () => (
    <div className="w-72">
      <Autocomplete defaultValue="Apple" items={fruits} readOnly>
        <AutocompleteInput placeholder="Search fruits..." />
        <AutocompletePopup>
          <AutocompleteEmpty>No fruits found.</AutocompleteEmpty>
          <AutocompleteList>
            {(item: Fruit) => (
              <AutocompleteItem key={item.value} value={item}>
                {item.label}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>
    </div>
  ),
})

type FruitGroup = { value: string; items: Fruit[] }

const groupedFruits: FruitGroup[] = [
  {
    value: "Citrus",
    items: [
      { value: "lemon", label: "Lemon" },
      { value: "orange", label: "Orange" },
      { value: "grapefruit", label: "Grapefruit" },
    ],
  },
  {
    value: "Berries",
    items: [
      { value: "blueberry", label: "Blueberry" },
      { value: "strawberry", label: "Strawberry" },
      { value: "raspberry", label: "Raspberry" },
    ],
  },
]

export const WithGroups = meta.story({
  render: () => (
    <div className="w-72">
      <Autocomplete items={groupedFruits}>
        <AutocompleteInput placeholder="Search..." />
        <AutocompletePopup>
          <AutocompleteEmpty>No matches.</AutocompleteEmpty>
          <AutocompleteList>
            {(group: FruitGroup, index: number) => (
              <Fragment key={group.value}>
                <AutocompleteGroup items={group.items}>
                  <AutocompleteGroupLabel>{group.value}</AutocompleteGroupLabel>
                  <AutocompleteCollection>
                    {(item: Fruit) => (
                      <AutocompleteItem key={item.value} value={item}>
                        {item.label}
                      </AutocompleteItem>
                    )}
                  </AutocompleteCollection>
                </AutocompleteGroup>
                {index < groupedFruits.length - 1 && <AutocompleteSeparator />}
              </Fragment>
            )}
          </AutocompleteList>
        </AutocompletePopup>
      </Autocomplete>
    </div>
  ),
})

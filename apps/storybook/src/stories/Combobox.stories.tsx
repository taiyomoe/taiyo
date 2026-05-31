import preview from "@/storybook/preview"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxSeparator,
  ComboboxValue,
} from "@taiyomoe/ui/components/ui/combobox"
import { fn } from "storybook/test"

type Fruit = { value: string; label: string; category: "citrus" | "berry" }

const fruits: Fruit[] = [
  { value: "apple", label: "Apple", category: "berry" },
  { value: "banana", label: "Banana", category: "berry" },
  { value: "blueberry", label: "Blueberry", category: "berry" },
  { value: "grapefruit", label: "Grapefruit", category: "citrus" },
  { value: "lemon", label: "Lemon", category: "citrus" },
  { value: "lime", label: "Lime", category: "citrus" },
  { value: "orange", label: "Orange", category: "citrus" },
  { value: "raspberry", label: "Raspberry", category: "berry" },
  { value: "strawberry", label: "Strawberry", category: "berry" },
]
const meta = preview.meta({
  title: "UI/Combobox",
  component: Combobox,
  subcomponents: {
    ComboboxInput,
    ComboboxPopup,
    ComboboxList,
    ComboboxItem,
    ComboboxGroup,
    ComboboxGroupLabel,
    ComboboxSeparator,
    ComboboxEmpty,
  },
  parameters: { layout: "centered" },
  args: { onValueChange: fn(), onOpenChange: fn() },
})

export const Default = meta.story({
  render: () => (
    <Combobox<Fruit, false> items={fruits}>
      <div className="w-72">
        <ComboboxInput placeholder="Search fruit..." />
      </div>
      <ComboboxPopup>
        <ComboboxList>
          {(fruit: Fruit) => (
            <ComboboxItem key={fruit.value} value={fruit}>
              {fruit.label}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
      </ComboboxPopup>
    </Combobox>
  ),
})

export const SelectedByDefault = meta.story({
  render: () => (
    <Combobox<Fruit, false> items={fruits} defaultValue={fruits[0]}>
      <div className="w-72">
        <ComboboxInput placeholder="Search fruit..." />
      </div>
      <ComboboxPopup>
        <ComboboxList>
          {(fruit: Fruit) => (
            <ComboboxItem key={fruit.value} value={fruit}>
              {fruit.label}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
      </ComboboxPopup>
    </Combobox>
  ),
})

export const Disabled = meta.story({
  render: () => (
    <Combobox<Fruit, false> items={fruits} disabled>
      <div className="w-72">
        <ComboboxInput placeholder="Search fruit..." />
      </div>
      <ComboboxPopup>
        <ComboboxList>
          {(fruit: Fruit) => (
            <ComboboxItem key={fruit.value} value={fruit}>
              {fruit.label}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
      </ComboboxPopup>
    </Combobox>
  ),
})

export const ReadOnly = meta.story({
  render: () => (
    <Combobox<Fruit, false> items={fruits} readOnly>
      <div className="w-72">
        <ComboboxInput placeholder="Search fruit..." />
      </div>
      <ComboboxPopup>
        <ComboboxList>
          {(fruit: Fruit) => (
            <ComboboxItem key={fruit.value} value={fruit}>
              {fruit.label}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
      </ComboboxPopup>
    </Combobox>
  ),
})

export const WithGroups = meta.story({
  render: () => (
    <Combobox<Fruit, false> items={fruits}>
      <div className="w-72">
        <ComboboxInput placeholder="Search fruit..." />
      </div>
      <ComboboxPopup>
        <ComboboxList>
          <ComboboxGroup>
            <ComboboxGroupLabel>Berries</ComboboxGroupLabel>
            {fruits
              .filter((f) => f.category === "berry")
              .map((fruit) => (
                <ComboboxItem key={fruit.value} value={fruit}>
                  {fruit.label}
                </ComboboxItem>
              ))}
          </ComboboxGroup>
          <ComboboxSeparator />
          <ComboboxGroup>
            <ComboboxGroupLabel>Citrus</ComboboxGroupLabel>
            {fruits
              .filter((f) => f.category === "citrus")
              .map((fruit) => (
                <ComboboxItem key={fruit.value} value={fruit}>
                  {fruit.label}
                </ComboboxItem>
              ))}
          </ComboboxGroup>
        </ComboboxList>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
      </ComboboxPopup>
    </Combobox>
  ),
})

export const Multiple = meta.story({
  render: () => (
    <Combobox<Fruit, true> items={fruits} multiple>
      <div className="w-72">
        <ComboboxChips>
          <ComboboxValue>
            {(value: Fruit[]) => (
              <>
                {value?.map((item) => (
                  <ComboboxChip aria-label={item.value} key={item.value}>
                    {item.label}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput
                  aria-label="Pick fruits"
                  placeholder={value.length > 0 ? undefined : "Pick fruits..."}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
      </div>
      <ComboboxPopup>
        <ComboboxList>
          {(fruit: Fruit) => (
            <ComboboxItem key={fruit.value} value={fruit}>
              {fruit.label}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
      </ComboboxPopup>
    </Combobox>
  ),
})

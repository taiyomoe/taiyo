import preview from "@/storybook/preview"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import { CheckboxGroup } from "@taiyomoe/ui/components/ui/checkbox-group"
import { Label } from "@taiyomoe/ui/components/ui/label"
import { fn } from "storybook/test"

const options = [
  { name: "manga", label: "Manga" },
  { name: "manhwa", label: "Manhwa" },
  { name: "manhua", label: "Manhua" },
] as const
const meta = preview.meta({
  title: "UI/CheckboxGroup",
  component: CheckboxGroup,
  parameters: { layout: "centered" },
  args: { onValueChange: fn() },
  render: (args) => (
    <CheckboxGroup {...args}>
      {options.map((option) => (
        <div className="flex items-center gap-2" key={option.name}>
          <Checkbox id={option.name} name={option.name} />
          <Label htmlFor={option.name}>{option.label}</Label>
        </div>
      ))}
    </CheckboxGroup>
  ),
})

export const Default = meta.story({})

export const WithDefaultValue = meta.story({
  args: { defaultValue: ["manga", "manhwa"] },
})

export const Disabled = meta.story({ args: { disabled: true } })

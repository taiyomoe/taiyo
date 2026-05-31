import preview from "@/storybook/preview"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { fn } from "storybook/test"

const items = [
  { value: "sans", label: "Sans-serif" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Monospace" },
  { value: "cursive", label: "Cursive" },
]
const meta = preview.meta({
  title: "UI/Select",
  component: Select,
  subcomponents: { SelectTrigger, SelectValue, SelectContent, SelectItem },
  parameters: { layout: "centered" },
  argTypes: {
    disabled: { control: "boolean" },
    multiple: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
  args: { items, onValueChange: fn() },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger>
        <SelectValue placeholder="Select font" />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
})

export const Default = meta.story({})

export const Sizes = meta.story({
  render: (args) => (
    <div className="flex flex-col items-stretch gap-2">
      <Select {...args}>
        <SelectTrigger size="sm">
          <SelectValue placeholder="Small" />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select {...args}>
        <SelectTrigger size="default">
          <SelectValue placeholder="Default" />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select {...args}>
        <SelectTrigger size="lg">
          <SelectValue placeholder="Large" />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
})

export const SelectedByDefault = meta.story({ args: { defaultValue: "sans" } })

export const Disabled = meta.story({
  args: { disabled: true, defaultValue: "sans" },
})

export const ReadOnly = meta.story({
  args: { readOnly: true, defaultValue: "sans" },
})

export const Multiple = meta.story({
  args: { multiple: true, defaultValue: ["sans", "mono"] },
})

export const WithGroups = meta.story({
  render: (args) => (
    <Select {...args}>
      <SelectTrigger>
        <SelectValue placeholder="Select font" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectGroupLabel>Latin</SelectGroupLabel>
          <SelectItem value="sans">Sans-serif</SelectItem>
          <SelectItem value="serif">Serif</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectGroupLabel>Display</SelectGroupLabel>
          <SelectItem value="mono">Monospace</SelectItem>
          <SelectItem value="cursive">Cursive</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
})

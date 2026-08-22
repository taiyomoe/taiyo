import preview from "@/storybook/preview"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import { Label } from "@taiyomoe/ui/components/ui/label"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/Label",
  component: Label,
  parameters: { layout: "centered" },
  args: { children: "Accept terms and conditions" },
})

export const Default = meta.story({})

export const WithCheckbox = meta.story({
  render: () => (
    <Label htmlFor="checkbox-terms">
      <Checkbox id="checkbox-terms" onCheckedChange={fn()} />
      Accept terms and conditions
    </Label>
  ),
})

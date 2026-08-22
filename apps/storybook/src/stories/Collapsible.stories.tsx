import preview from "@/storybook/preview"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@taiyomoe/ui/components/ui/collapsible"
import { ChevronDownIcon } from "lucide-react"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/Collapsible",
  component: Collapsible,
  subcomponents: { CollapsibleTrigger, CollapsiblePanel },
  parameters: { layout: "centered" },
  argTypes: {
    disabled: { control: "boolean" },
    defaultOpen: { control: "boolean" },
  },
  args: { onOpenChange: fn() },
})

export const Default = meta.story({
  render: (args) => (
    <Collapsible {...args} className="w-72">
      <CollapsibleTrigger
        render={
          <Button className="w-full justify-between" variant="outline">
            <span>Recent activity</span>
            <ChevronDownIcon className="transition-transform data-[panel-open]:rotate-180" />
          </Button>
        }
      />
      <CollapsiblePanel>
        <div className="mt-2 flex flex-col gap-2 rounded-md border bg-popover p-3 text-sm">
          <div>Created a new project.</div>
          <div>Invited 3 collaborators.</div>
          <div>Updated profile picture.</div>
        </div>
      </CollapsiblePanel>
    </Collapsible>
  ),
})

export const OpenByDefault = meta.story({
  args: { defaultOpen: true },
  render: (args) => (
    <Collapsible {...args} className="w-72">
      <CollapsibleTrigger
        render={
          <Button className="w-full justify-between" variant="outline">
            <span>Recent activity</span>
            <ChevronDownIcon className="transition-transform data-[panel-open]:rotate-180" />
          </Button>
        }
      />
      <CollapsiblePanel>
        <div className="mt-2 flex flex-col gap-2 rounded-md border bg-popover p-3 text-sm">
          <div>Created a new project.</div>
          <div>Invited 3 collaborators.</div>
          <div>Updated profile picture.</div>
        </div>
      </CollapsiblePanel>
    </Collapsible>
  ),
})

export const Disabled = meta.story({
  args: { disabled: true },
  render: (args) => (
    <Collapsible {...args} className="w-72">
      <CollapsibleTrigger
        render={
          <Button className="w-full justify-between" variant="outline">
            <span>Recent activity</span>
            <ChevronDownIcon className="transition-transform data-[panel-open]:rotate-180" />
          </Button>
        }
      />
      <CollapsiblePanel>
        <div className="mt-2 flex flex-col gap-2 rounded-md border bg-popover p-3 text-sm">
          <div>Created a new project.</div>
          <div>Invited 3 collaborators.</div>
          <div>Updated profile picture.</div>
        </div>
      </CollapsiblePanel>
    </Collapsible>
  ),
})

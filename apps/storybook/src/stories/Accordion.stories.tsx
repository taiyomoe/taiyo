import preview from "@/storybook/preview"
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@taiyomoe/ui/components/ui/accordion"
import { fn } from "storybook/test"

const items = [
  {
    value: "item-1",
    title: "What is Taiyō?",
    content:
      "Taiyō is an open-source manga reader and library manager focused on speed, polish, and a great reading experience.",
  },
  {
    value: "item-2",
    title: "How do I get started?",
    content:
      "Install the desktop app or use the web reader. Sign in with your account to sync your library and reading progress across devices.",
  },
  {
    value: "item-3",
    title: "Is it free?",
    content:
      "Yes — Taiyō is free and open source under a permissive license. Contributions are welcome on GitHub.",
  },
]
const meta = preview.meta({
  title: "UI/Accordion",
  component: Accordion,
  subcomponents: { AccordionItem, AccordionTrigger, AccordionPanel },
  parameters: { layout: "centered" },
  argTypes: {
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
    },
  },
  args: { onValueChange: fn() },
  render: (args) => (
    <div className="w-96">
      <Accordion {...args}>
        {items.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionPanel>{item.content}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
})

export const Default = meta.story({})

export const Single = meta.story({
  args: { multiple: false, defaultValue: ["item-1"] },
})

export const Multiple = meta.story({
  args: { multiple: true, defaultValue: ["item-1", "item-2"] },
})

export const Disabled = meta.story({
  args: { disabled: true, defaultValue: ["item-1"] },
})

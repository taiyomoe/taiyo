import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { ScrollArea, ScrollBar } from "@taiyomoe/ui/components/scroll-area"

const LoremIpsum = () => (
  <div className="space-y-2 p-4 text-primary">
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
      vestibulum, ex ac tempus eleifend, orci augue dignissim dui, eu aliquam
      mauris ante eu justo. Proin eget scelerisque urna, vitae convallis quam.
      Vestibulum tempor felis elit. Nullam lobortis vel mauris blandit accumsan.
      Vestibulum efficitur, dui pellentesque accumsan ultricies, eros ex rutrum
      arcu, non hendrerit libero nibh nec purus. Ut id ultrices orci, venenatis
      fermentum ante. Aliquam rutrum accumsan bibendum. Aenean mauris est,
      aliquet in condimentum id, luctus vitae tortor. Nulla id orci a eros
      scelerisque rhoncus id eget augue. Donec ornare sollicitudin nisi, in
      dictum diam vehicula nec.
    </p>
    <p>
      Fusce commodo erat sapien, vel semper justo interdum a. Nunc ut tincidunt
      massa. Nulla interdum enim vitae odio euismod, a pulvinar eros
      scelerisque. Etiam quis aliquet enim, id cursus felis. Fusce id est
      pharetra, mollis tortor id, facilisis erat. Nunc elementum vitae mi et
      tempor. Praesent eu eros id quam iaculis vulputate rutrum ac turpis.
      Praesent rutrum erat scelerisque, ultrices orci sit amet, dictum lectus.
      Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
      cubilia curae; Nullam rutrum cursus ligula a tempor. Nunc sed felis
      fermentum, dignissim odio nec, varius tellus.
    </p>
  </div>
)

const meta = {
  title: "UI/ScrollArea",
  component: ScrollArea,
  subcomponents: { ScrollBar },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A customizable scroll area component with optional masks and different orientations.",
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["auto", "always", "scroll", "hover"],
      description: "Controls when the scrollbar is visible",
    },
    maskHeight: {
      control: { type: "number", min: 0, max: 100, step: 5 },
      description: "Height of the fade mask in pixels. Set to 0 to disable.",
    },
  },
  args: {
    type: "hover",
    maskHeight: 30,
  },
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <ScrollArea {...args} className="h-64 w-80 rounded border">
      <LoremIpsum />
    </ScrollArea>
  ),
}

export const Horizontal: Story = {
  args: {},
  render: (args) => (
    <ScrollArea {...args} className="h-48 w-80 rounded border bg-default">
      <LoremIpsum />
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
}

export const AlwaysVisible: Story = {
  args: {
    type: "always",
    maskHeight: 30,
  },
  render: (args) => (
    <ScrollArea {...args} className="h-64 w-80 rounded border">
      <LoremIpsum />
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  ),
}

export const NoMask: Story = {
  args: {
    type: "hover",
    maskHeight: 0,
  },
  render: (args) => (
    <ScrollArea {...args} className="h-64 w-80 rounded border">
      <LoremIpsum />
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  ),
}

export const ScrollOnScroll: Story = {
  args: {
    type: "scroll",
    maskHeight: 30,
  },
  render: (args) => (
    <ScrollArea {...args} className="h-64 w-80 rounded border">
      <LoremIpsum />
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  ),
}

export const CustomMaskHeight: Story = {
  args: {
    type: "hover",
    maskHeight: 60,
  },
  render: (args) => (
    <ScrollArea {...args} className="h-64 w-80 rounded border">
      <LoremIpsum />
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  ),
}

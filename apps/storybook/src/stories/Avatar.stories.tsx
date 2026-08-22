import preview from "@/storybook/preview"
import { Avatar, AvatarFallback, AvatarImage } from "@taiyomoe/ui/components/ui/avatar"

const meta = preview.meta({
  title: "UI/Avatar",
  component: Avatar,
  subcomponents: { AvatarImage, AvatarFallback },
  parameters: { layout: "centered" },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage alt="User avatar" src="https://i.pravatar.cc/96?img=12" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
})

export const Default = meta.story({})

export const Sizes = meta.story({
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar className="size-6">
        <AvatarImage alt="User" src="https://i.pravatar.cc/96?img=12" />
        <AvatarFallback>XS</AvatarFallback>
      </Avatar>
      <Avatar className="size-8">
        <AvatarImage alt="User" src="https://i.pravatar.cc/96?img=12" />
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar className="size-10">
        <AvatarImage alt="User" src="https://i.pravatar.cc/96?img=12" />
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar className="size-12">
        <AvatarImage alt="User" src="https://i.pravatar.cc/96?img=12" />
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
      <Avatar className="size-16">
        <AvatarImage alt="User" src="https://i.pravatar.cc/96?img=12" />
        <AvatarFallback>XL</AvatarFallback>
      </Avatar>
    </div>
  ),
})

export const Fallback = meta.story({
  render: () => (
    <Avatar>
      <AvatarImage alt="" src="" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
})

export const Group = meta.story({
  render: () => (
    <div className="flex -space-x-2">
      <Avatar className="ring-2 ring-background">
        <AvatarImage alt="User 1" src="https://i.pravatar.cc/96?img=12" />
        <AvatarFallback>U1</AvatarFallback>
      </Avatar>
      <Avatar className="ring-2 ring-background">
        <AvatarImage alt="User 2" src="https://i.pravatar.cc/96?img=32" />
        <AvatarFallback>U2</AvatarFallback>
      </Avatar>
      <Avatar className="ring-2 ring-background">
        <AvatarImage alt="User 3" src="https://i.pravatar.cc/96?img=47" />
        <AvatarFallback>U3</AvatarFallback>
      </Avatar>
      <Avatar className="ring-2 ring-background">
        <AvatarFallback>+3</AvatarFallback>
      </Avatar>
    </div>
  ),
})

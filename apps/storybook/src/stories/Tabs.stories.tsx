import preview from "@/storybook/preview"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@taiyomoe/ui/components/ui/tabs"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/Tabs",
  component: Tabs,
  parameters: { layout: "centered" },
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
  args: { onValueChange: fn() },
  render: (args) => (
    <Tabs defaultValue="account" {...args} className="w-96">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent className="text-sm" value="account">
        Update your account details here.
      </TabsContent>
      <TabsContent className="text-sm" value="password">
        Change your password here.
      </TabsContent>
      <TabsContent className="text-sm" value="notifications">
        Manage your notification preferences here.
      </TabsContent>
    </Tabs>
  ),
})

export const Default = meta.story({})

export const Underline = meta.story({
  render: (args) => (
    <Tabs defaultValue="account" {...args} className="w-96">
      <TabsList variant="underline">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent className="text-sm" value="account">
        Update your account details here.
      </TabsContent>
      <TabsContent className="text-sm" value="password">
        Change your password here.
      </TabsContent>
      <TabsContent className="text-sm" value="notifications">
        Manage your notification preferences here.
      </TabsContent>
    </Tabs>
  ),
})

export const Vertical = meta.story({
  args: { orientation: "vertical" },
  render: (args) => (
    <Tabs defaultValue="account" {...args} className="w-105">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent className="text-sm" value="account">
        Update your account details here.
      </TabsContent>
      <TabsContent className="text-sm" value="password">
        Change your password here.
      </TabsContent>
      <TabsContent className="text-sm" value="notifications">
        Manage your notification preferences here.
      </TabsContent>
    </Tabs>
  ),
})

export const Disabled = meta.story({
  render: (args) => (
    <Tabs defaultValue="account" {...args} className="w-96">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger disabled value="password">
          Password
        </TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent className="text-sm" value="account">
        Update your account details here.
      </TabsContent>
      <TabsContent className="text-sm" value="password">
        Change your password here.
      </TabsContent>
      <TabsContent className="text-sm" value="notifications">
        Manage your notification preferences here.
      </TabsContent>
    </Tabs>
  ),
})

import * as stylex from "@stylexjs/stylex"
import preview from "@/storybook/preview"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@taiyomoe/ui/components/ui/tabs"
import { fn } from "storybook/test"

const styles = stylex.create({
  anchor: {
    width: "24rem",
  },
  text: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  anchor2: {
    width: "26.25rem",
  },
})
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
    <Tabs defaultValue="account" {...args} sx={styles.anchor}>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent sx={styles.text} value="account">
        Update your account details here.
      </TabsContent>
      <TabsContent sx={styles.text} value="password">
        Change your password here.
      </TabsContent>
      <TabsContent sx={styles.text} value="notifications">
        Manage your notification preferences here.
      </TabsContent>
    </Tabs>
  ),
})

export const Default = meta.story({})

export const Underline = meta.story({
  render: (args) => (
    <Tabs defaultValue="account" {...args} sx={styles.anchor}>
      <TabsList variant="underline">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent sx={styles.text} value="account">
        Update your account details here.
      </TabsContent>
      <TabsContent sx={styles.text} value="password">
        Change your password here.
      </TabsContent>
      <TabsContent sx={styles.text} value="notifications">
        Manage your notification preferences here.
      </TabsContent>
    </Tabs>
  ),
})

export const Vertical = meta.story({
  args: { orientation: "vertical" },
  render: (args) => (
    <Tabs defaultValue="account" {...args} sx={styles.anchor2}>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent sx={styles.text} value="account">
        Update your account details here.
      </TabsContent>
      <TabsContent sx={styles.text} value="password">
        Change your password here.
      </TabsContent>
      <TabsContent sx={styles.text} value="notifications">
        Manage your notification preferences here.
      </TabsContent>
    </Tabs>
  ),
})

export const Disabled = meta.story({
  render: (args) => (
    <Tabs defaultValue="account" {...args} sx={styles.anchor}>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger disabled value="password">
          Password
        </TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent sx={styles.text} value="account">
        Update your account details here.
      </TabsContent>
      <TabsContent sx={styles.text} value="password">
        Change your password here.
      </TabsContent>
      <TabsContent sx={styles.text} value="notifications">
        Manage your notification preferences here.
      </TabsContent>
    </Tabs>
  ),
})

import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import preview from "@/storybook/preview"
import { Avatar, AvatarFallback, AvatarImage } from "@taiyomoe/ui/components/ui/avatar"

const styles = stylex.create({
  /** Overlapping avatars: each one is pulled back over the last. */
  stack: {
    display: "flex",
  },
  /**
   * Each avatar is pulled back over the one before it, and a ring in the page
   * colour is what keeps the two readable where they overlap.
   */
  stacked: {
    boxShadow: `0 0 0 2px ${colors.background}`,
    marginLeft: { default: "-0.5rem", ":first-child": 0 },
  },
  row: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
  },
  icon: {
    height: "1.5rem",
    width: "1.5rem",
  },
  icon2: {
    height: "2rem",
    width: "2rem",
  },
  icon3: {
    height: "2.5rem",
    width: "2.5rem",
  },
  icon4: {
    height: "3rem",
    width: "3rem",
  },
  icon5: {
    height: "4rem",
    width: "4rem",
  },
})
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
    <div sx={styles.row}>
      <Avatar sx={styles.icon}>
        <AvatarImage alt="User" src="https://i.pravatar.cc/96?img=12" />
        <AvatarFallback>XS</AvatarFallback>
      </Avatar>
      <Avatar sx={styles.icon2}>
        <AvatarImage alt="User" src="https://i.pravatar.cc/96?img=12" />
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar sx={styles.icon3}>
        <AvatarImage alt="User" src="https://i.pravatar.cc/96?img=12" />
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar sx={styles.icon4}>
        <AvatarImage alt="User" src="https://i.pravatar.cc/96?img=12" />
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
      <Avatar sx={styles.icon5}>
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
    <div sx={styles.stack}>
      <Avatar sx={styles.stacked}>
        <AvatarImage alt="User 1" src="https://i.pravatar.cc/96?img=12" />
        <AvatarFallback>U1</AvatarFallback>
      </Avatar>
      <Avatar sx={styles.stacked}>
        <AvatarImage alt="User 2" src="https://i.pravatar.cc/96?img=32" />
        <AvatarFallback>U2</AvatarFallback>
      </Avatar>
      <Avatar sx={styles.stacked}>
        <AvatarImage alt="User 3" src="https://i.pravatar.cc/96?img=47" />
        <AvatarFallback>U3</AvatarFallback>
      </Avatar>
      <Avatar sx={styles.stacked}>
        <AvatarFallback>+3</AvatarFallback>
      </Avatar>
    </div>
  ),
})

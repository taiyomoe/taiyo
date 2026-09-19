import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import {
  Cancel01Icon,
  CreditCardIcon as CreditCardGlyph,
  Mail01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import preview from "@/storybook/preview"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@taiyomoe/ui/components/ui/input-group"
import { Kbd } from "@taiyomoe/ui/components/ui/kbd"

const styles = stylex.create({
  anchor: {
    width: "20rem",
  },
  surface: {
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  surface2: {
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  spacing: {
    marginLeft: "auto",
  },
})
const meta = preview.meta({
  title: "UI/InputGroup",
  component: InputGroup,
  subcomponents: {
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
    InputGroupTextarea,
  },
  parameters: { layout: "centered" },
  render: (args) => (
    <div sx={styles.anchor}>
      <InputGroup {...args}>
        <InputGroupAddon>
          <HugeiconsIcon icon={Search01Icon} />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search…" />
      </InputGroup>
    </div>
  ),
})

export const Default = meta.story({})

export const LeadingIcon = meta.story({
  render: () => (
    <div sx={styles.anchor}>
      <InputGroup>
        <InputGroupAddon>
          <HugeiconsIcon icon={Mail01Icon} />
        </InputGroupAddon>
        <InputGroupInput placeholder="you@example.com" type="email" />
      </InputGroup>
    </div>
  ),
})

export const TrailingIcon = meta.story({
  render: () => (
    <div sx={styles.anchor}>
      <InputGroup>
        <InputGroupInput placeholder="Card number" />
        <InputGroupAddon align="inline-end">
          <HugeiconsIcon icon={CreditCardGlyph} />
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
})

export const WithText = meta.story({
  render: () => (
    <div sx={styles.anchor}>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>.com</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
})

export const WithButton = meta.story({
  render: () => (
    <div sx={styles.anchor}>
      <InputGroup>
        <InputGroupAddon>
          <HugeiconsIcon icon={Search01Icon} />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search…" defaultValue="taiyo" />
        <InputGroupAddon align="inline-end">
          <Button size="icon-xs" variant="ghost" aria-label="Clear">
            <HugeiconsIcon icon={Cancel01Icon} />
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
})

export const WithKbd = meta.story({
  render: () => (
    <div sx={styles.anchor}>
      <InputGroup>
        <InputGroupAddon>
          <HugeiconsIcon icon={Search01Icon} />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search…" />
        <InputGroupAddon align="inline-end">
          <Kbd>⌘K</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
})

export const BlockStart = meta.story({
  render: () => (
    <div sx={styles.anchor}>
      <InputGroup>
        <InputGroupAddon align="block-start" sx={styles.surface}>
          <InputGroupText>Compose</InputGroupText>
        </InputGroupAddon>
        <InputGroupTextarea placeholder="Write a message…" />
      </InputGroup>
    </div>
  ),
})

export const BlockEnd = meta.story({
  render: () => (
    <div sx={styles.anchor}>
      <InputGroup>
        <InputGroupTextarea placeholder="Write a message…" />
        <InputGroupAddon align="block-end" sx={styles.surface2}>
          <Button size="sm" sx={styles.spacing}>
            Send
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
})

export const Disabled = meta.story({
  render: () => (
    <div sx={styles.anchor}>
      <InputGroup>
        <InputGroupAddon>
          <HugeiconsIcon icon={Search01Icon} />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search…" disabled />
      </InputGroup>
    </div>
  ),
})

export const Invalid = meta.story({
  render: () => (
    <div sx={styles.anchor}>
      <InputGroup>
        <InputGroupAddon>
          <HugeiconsIcon icon={Mail01Icon} />
        </InputGroupAddon>
        <InputGroupInput aria-invalid defaultValue="not-an-email" type="email" />
      </InputGroup>
    </div>
  ),
})

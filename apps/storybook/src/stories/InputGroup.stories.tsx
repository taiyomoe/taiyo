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
import { CreditCardIcon, MailIcon, SearchIcon, XIcon } from "lucide-react"

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
    <div className="w-80">
      <InputGroup {...args}>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search…" />
      </InputGroup>
    </div>
  ),
})

export const Default = meta.story({})

export const LeadingIcon = meta.story({
  render: () => (
    <div className="w-80">
      <InputGroup>
        <InputGroupAddon>
          <MailIcon />
        </InputGroupAddon>
        <InputGroupInput placeholder="you@example.com" type="email" />
      </InputGroup>
    </div>
  ),
})

export const TrailingIcon = meta.story({
  render: () => (
    <div className="w-80">
      <InputGroup>
        <InputGroupInput placeholder="Card number" />
        <InputGroupAddon align="inline-end">
          <CreditCardIcon />
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
})

export const WithText = meta.story({
  render: () => (
    <div className="w-80">
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
    <div className="w-80">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search…" defaultValue="taiyo" />
        <InputGroupAddon align="inline-end">
          <Button size="icon-xs" variant="ghost" aria-label="Clear">
            <XIcon />
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
})

export const WithKbd = meta.story({
  render: () => (
    <div className="w-80">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
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
    <div className="w-80">
      <InputGroup>
        <InputGroupAddon align="block-start" className="border-b">
          <InputGroupText>Compose</InputGroupText>
        </InputGroupAddon>
        <InputGroupTextarea placeholder="Write a message…" />
      </InputGroup>
    </div>
  ),
})

export const BlockEnd = meta.story({
  render: () => (
    <div className="w-80">
      <InputGroup>
        <InputGroupTextarea placeholder="Write a message…" />
        <InputGroupAddon align="block-end" className="border-t">
          <Button size="sm" className="ml-auto">
            Send
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
})

export const Disabled = meta.story({
  render: () => (
    <div className="w-80">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search…" disabled />
      </InputGroup>
    </div>
  ),
})

export const Invalid = meta.story({
  render: () => (
    <div className="w-80">
      <InputGroup>
        <InputGroupAddon>
          <MailIcon />
        </InputGroupAddon>
        <InputGroupInput aria-invalid defaultValue="not-an-email" type="email" />
      </InputGroup>
    </div>
  ),
})

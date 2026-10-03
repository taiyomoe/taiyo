import preview from "@/storybook/preview"
import { OTPField, OTPFieldInput, OTPFieldSeparator } from "@taiyomoe/ui/components/ui/otp-field"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/OtpField",
  component: OTPField,
  subcomponents: { OTPFieldInput, OTPFieldSeparator },
  parameters: { layout: "centered" },
  args: {
    onValueChange: fn(),
    onValueComplete: fn(),
  },
})

export const Default = meta.story({
  render: () => (
    <OTPField length={6}>
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
    </OTPField>
  ),
})

export const Large = meta.story({
  render: () => (
    <OTPField length={6} size="lg">
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
    </OTPField>
  ),
})

export const FourDigits = meta.story({
  render: () => (
    <OTPField length={4}>
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
    </OTPField>
  ),
})

export const EightDigits = meta.story({
  render: () => (
    <OTPField length={8}>
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
    </OTPField>
  ),
})

export const Masked = meta.story({
  render: () => (
    <OTPField length={6} mask defaultValue="123456">
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
    </OTPField>
  ),
})

export const Alphanumeric = meta.story({
  render: () => (
    <OTPField length={6} validationType="alphanumeric">
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
    </OTPField>
  ),
})

export const WithDefaultValue = meta.story({
  render: () => (
    <OTPField length={6} defaultValue="428193">
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
    </OTPField>
  ),
})

export const WithSeparator = meta.story({
  render: () => (
    <OTPField length={6}>
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldSeparator />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
    </OTPField>
  ),
})

export const Disabled = meta.story({
  render: () => (
    <OTPField length={6} disabled defaultValue="123456">
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
    </OTPField>
  ),
})

export const ReadOnly = meta.story({
  render: () => (
    <OTPField length={6} readOnly defaultValue="123456">
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
      <OTPFieldInput />
    </OTPField>
  ),
})

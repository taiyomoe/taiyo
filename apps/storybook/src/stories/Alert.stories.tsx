import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import preview from "@/storybook/preview"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@taiyomoe/ui/components/ui/alert"
import { Button } from "@taiyomoe/ui/components/ui/button"

const meta = preview.meta({
  title: "UI/Alert",
  component: Alert,
  subcomponents: { AlertTitle, AlertDescription, AlertAction },
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "error", "info", "success", "warning"],
    },
  },
  render: (args) => (
    <div className="w-96">
      <Alert {...args}>
        <HugeiconsIcon icon={InformationCircleIcon} />
        <AlertTitle>New update available</AlertTitle>
        <AlertDescription>
          A new version of Taiyō is ready to install. Restart the app to apply the update.
        </AlertDescription>
      </Alert>
    </div>
  ),
})

export const Default = meta.story({})

export const Variants = meta.story({
  render: () => (
    <div className="flex w-96 flex-col gap-3">
      <Alert variant="default">
        <HugeiconsIcon icon={InformationCircleIcon} />
        <AlertTitle>Default</AlertTitle>
        <AlertDescription>A neutral message with no particular emphasis.</AlertDescription>
      </Alert>
      <Alert variant="info">
        <HugeiconsIcon icon={InformationCircleIcon} />
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>Informational message that does not require action.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>Your changes have been saved successfully.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <HugeiconsIcon icon={Alert02Icon} />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>This action may have unintended side effects.</AlertDescription>
      </Alert>
      <Alert variant="error">
        <HugeiconsIcon icon={Alert02Icon} />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong while saving your changes.</AlertDescription>
      </Alert>
    </div>
  ),
})

export const WithAction = meta.story({
  render: () => (
    <Alert className="w-md" variant="warning">
      <HugeiconsIcon icon={Alert02Icon} />
      <AlertTitle>Unsaved changes</AlertTitle>
      <AlertDescription>
        You have unsaved changes. Save them before leaving this page.
      </AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline">
          Save
        </Button>
      </AlertAction>
    </Alert>
  ),
})

export const TitleOnly = meta.story({
  render: () => (
    <Alert className="w-96" variant="info">
      <HugeiconsIcon icon={InformationCircleIcon} />
      <AlertTitle>Sync completed</AlertTitle>
    </Alert>
  ),
})

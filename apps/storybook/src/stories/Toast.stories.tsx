import preview from "@/storybook/preview"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { type ToastPosition, ToastPrimitive, ToastProvider } from "@taiyomoe/ui/components/ui/toast"

const meta = preview.meta({
  title: "UI/Toast",
  component: ToastProvider,
  parameters: { layout: "centered" },
  argTypes: {
    position: {
      control: { type: "select" },
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    },
  },
})

export const Default = meta.story({
  render: () => {
    const Trigger = () => {
      const manager = ToastPrimitive.useToastManager()

      return (
        <Button
          onClick={() =>
            manager.add({
              title: "Notification",
              description: "Your changes have been saved.",
            })
          }
          variant="outline"
        >
          Show toast
        </Button>
      )
    }

    return (
      <ToastProvider position="bottom-right">
        <Trigger />
      </ToastProvider>
    )
  },
})

export const Success = meta.story({
  render: () => {
    const Trigger = () => {
      const manager = ToastPrimitive.useToastManager()

      return (
        <Button
          onClick={() =>
            manager.add({
              type: "success",
              title: "Saved",
              description: "Your changes have been saved successfully.",
            })
          }
          variant="outline"
        >
          Show toast
        </Button>
      )
    }

    return (
      <ToastProvider position="bottom-right">
        <Trigger />
      </ToastProvider>
    )
  },
})

export const Error = meta.story({
  render: () => {
    const Trigger = () => {
      const manager = ToastPrimitive.useToastManager()

      return (
        <Button
          onClick={() =>
            manager.add({
              type: "error",
              title: "Something went wrong",
              description: "We couldn't save your changes. Please try again.",
            })
          }
          variant="outline"
        >
          Show toast
        </Button>
      )
    }

    return (
      <ToastProvider position="bottom-right">
        <Trigger />
      </ToastProvider>
    )
  },
})

export const Info = meta.story({
  render: () => {
    const Trigger = () => {
      const manager = ToastPrimitive.useToastManager()

      return (
        <Button
          onClick={() =>
            manager.add({
              type: "info",
              title: "Heads up",
              description: "A new version is available.",
            })
          }
          variant="outline"
        >
          Show toast
        </Button>
      )
    }

    return (
      <ToastProvider position="bottom-right">
        <Trigger />
      </ToastProvider>
    )
  },
})

export const Warning = meta.story({
  render: () => {
    const Trigger = () => {
      const manager = ToastPrimitive.useToastManager()

      return (
        <Button
          onClick={() =>
            manager.add({
              type: "warning",
              title: "Be careful",
              description: "This action cannot be undone.",
            })
          }
          variant="outline"
        >
          Show toast
        </Button>
      )
    }

    return (
      <ToastProvider position="bottom-right">
        <Trigger />
      </ToastProvider>
    )
  },
})

export const Loading = meta.story({
  render: () => {
    const Trigger = () => {
      const manager = ToastPrimitive.useToastManager()

      return (
        <Button
          onClick={() =>
            manager.add({
              type: "loading",
              title: "Saving",
              description: "Please wait while we save your changes.",
            })
          }
          variant="outline"
        >
          Show toast
        </Button>
      )
    }

    return (
      <ToastProvider position="bottom-right">
        <Trigger />
      </ToastProvider>
    )
  },
})

const POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const

export const Positions = meta.story({
  render: () => {
    const Trigger = ({ position }: { position: ToastPosition }) => {
      const manager = ToastPrimitive.useToastManager()

      return (
        <Button
          onClick={() => manager.add({ title: position, description: `Toast from ${position}` })}
          variant="outline"
        >
          {position}
        </Button>
      )
    }

    return (
      <div className="flex flex-wrap gap-2">
        {POSITIONS.map((position) => (
          <ToastProvider key={position} position={position}>
            <Trigger position={position} />
          </ToastProvider>
        ))}
      </div>
    )
  },
})

export const WithAction = meta.story({
  render: () => {
    const Trigger = () => {
      const manager = ToastPrimitive.useToastManager()

      return (
        <Button
          onClick={() =>
            manager.add({
              type: "success",
              title: "Item archived",
              description: "You can undo this action.",
              actionProps: { children: "Undo", onClick: () => undefined },
            })
          }
          variant="outline"
        >
          Show toast
        </Button>
      )
    }

    return (
      <ToastProvider position="bottom-right">
        <Trigger />
      </ToastProvider>
    )
  },
})

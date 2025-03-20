import { Toaster as SonnerToaster } from "sonner"

export const Toaster = () => {
  return (
    <SonnerToaster
      position="top-right"
      closeButton
      toastOptions={{
        unstyled: true,
        classNames: {
          default:
            "bg-muted border-subtle flex gap-2 min-w-84 max-w-84 p-4 h-(--initial-height) relative rounded border **:transition-colors!",
          content: "text-primary text-sm font-medium",
          closeButton:
            "bg-muted border-subtle text-subtle hover:text-primary absolute -top-1.5 -left-1.5 p-1 rounded-full border hover:bg-subtle",
          info: "bg-info! border-info-subtle/60! **:text-info-subtle [&_button]:bg-info [&_button]:border-info-subtle/60 [&_button]:hover:bg-info-subtle!",
          success:
            "bg-success! border-success-subtle/60! **:text-success-subtle [&_button]:bg-success [&_button]:border-success-subtle/60 [&_button]:hover:bg-success-subtle!",
          warning:
            "bg-warning! border-warning-subtle/60! **:text-warning-subtle [&_button]:bg-warning [&_button]:border-warning-subtle/60 [&_button]:hover:bg-warning-subtle!",
          error:
            "bg-error! border-error-subtle/60! **:text-error-subtle [&_button]:bg-error [&_button]:border-error-subtle/60 [&_button]:hover:bg-error-subtle!",
        },
      }}
    />
  )
}

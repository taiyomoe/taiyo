import { PanelLeft } from "@taiyomoe/ui/components/icons"
import { useSidebar } from "@taiyomoe/ui/components/ui/sidebar"
import { useRegisterCommands } from "@/features/command-palette/hooks/use-register-commands"
import { m } from "@/paraglide/messages"

export function ShellCommands() {
  const { toggleSidebar } = useSidebar()

  useRegisterCommands([
    {
      id: "shell.toggle-sidebar",
      label: m.shell_toggle_sidebar(),
      section: "preferences",
      icon: PanelLeft,
      keywords: ["sidebar", "navigation", "menu", "collapse", "expand", "hide", "show"],
      run: { type: "perform", perform: toggleSidebar },
    },
  ])

  return null
}

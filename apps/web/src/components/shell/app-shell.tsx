import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { SidebarInset, SidebarProvider } from "@taiyomoe/ui/components/ui/sidebar"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouteContext } from "@tanstack/react-router"
import { useEffect, useSyncExternalStore } from "react"
import type { Session } from "@/lib/session"
import { AppNavbar } from "@/components/shell/app-navbar"
import { type AppSidebarSection, AppSidebar } from "@/components/shell/app-sidebar"
import { ShellCommands } from "@/components/shell/shell-commands"
import { uploadStore } from "@/features/uploads/lib/chapter-batch/upload-store"
import { createLazyComponent } from "@/lib/lazy-component"
import { sessionQueryOptions } from "@/lib/session"

// Both only show in rare states, so they download when that state starts.
const UploadTray = createLazyComponent(
  async () => (await import("@/components/shell/upload-tray")).UploadTray,
)
const ImpersonationBar = createLazyComponent(
  async () => (await import("@/components/shell/impersonation-bar")).ImpersonationBar,
)
const styles = stylex.create({
  provider: {
    "--navbar-height": "4.5rem",
    flexDirection: "column",
  },
  body: {
    flex: "1",
    display: "flex",
    minHeight: 0,
    paddingTop: "var(--navbar-height)",
  },
  inset: {
    minWidth: 0,
  },
})

export function AppShell({
  user,
  overlayNavbar = false,
  sections,
  children,
}: {
  user: Session["user"] | null
  overlayNavbar?: boolean
  sections?: readonly AppSidebarSection[]
  children: ReactNode
}) {
  const { sidebarPrefs } = useRouteContext({ from: "__root__" })

  return (
    <SidebarProvider
      data-app-shell=""
      defaultOpen={sidebarPrefs.defaultOpen}
      defaultWidth={sidebarPrefs.defaultWidth ?? 248}
      sx={styles.provider}
    >
      <AppNavbar overlay={overlayNavbar} user={user} />
      <div sx={styles.body}>
        <AppSidebar fullHeight={overlayNavbar} sections={sections} />
        <SidebarInset sx={styles.inset}>{children}</SidebarInset>
      </div>
      <ActiveUploads />
      <Impersonation />
      <ShellCommands />
    </SidebarProvider>
  )
}

function ActiveUploads() {
  const queryClient = useQueryClient()
  const uploading = useSyncExternalStore(
    uploadStore.subscribe,
    () => uploadStore.getSnapshot().length > 0,
    () => false,
  )

  useEffect(() => {
    uploadStore.connect(queryClient)
  }, [queryClient])

  return uploading ? <UploadTray /> : null
}

function Impersonation() {
  const { data } = useQuery(sessionQueryOptions)

  return typeof data?.session.impersonatedBy === "string" ? <ImpersonationBar /> : null
}

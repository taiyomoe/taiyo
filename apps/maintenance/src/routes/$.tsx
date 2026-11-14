import { createFileRoute } from "@tanstack/react-router"
import { MaintenancePage } from "@/features/maintenance/components/maintenance-page"

export const Route = createFileRoute("/$")({
  component: MaintenancePage,
})

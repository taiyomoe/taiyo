import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { DashboardOverview } from "@/features/dashboard/api/overview"
import { CardSkeleton } from "@/features/dashboard/components/overview/card-skeleton"
import { DashboardCard } from "@/features/dashboard/components/overview/dashboard-card"
import { PeriodLegend } from "@/features/dashboard/components/overview/period-legend"
import { TopUploaders } from "@/features/dashboard/components/overview/top-uploaders"
import { m } from "@/paraglide/messages"

type UploadersCardProps = {
  overview: DashboardOverview | undefined
  compare: boolean
  subtitle: string
  tone: string
  previousTone: string
  sx: Sx
}

export function UploadersCard({
  overview,
  compare,
  subtitle,
  tone,
  previousTone,
  sx,
}: UploadersCardProps) {
  return (
    <DashboardCard subtitle={subtitle} sx={sx} title={m.dashboard_uploaders_title()}>
      {overview === undefined ? (
        <CardSkeleton />
      ) : (
        <>
          <TopUploaders
            compare={compare}
            overview={overview}
            previousTone={previousTone}
            tone={tone}
          />
          {compare && overview.topUploaders.length > 0 ? (
            <PeriodLegend previousTone={previousTone} shape="bullet" tone={tone} />
          ) : null}
        </>
      )}
    </DashboardCard>
  )
}

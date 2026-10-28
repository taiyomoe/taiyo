import * as stylex from "@stylexjs/stylex"
import { Clock, Mail, NoteEdit, Upload, Users } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { MyOverview } from "@/features/dashboard/api/my-overview"
import { homeStyles } from "@/features/dashboard/components/home/home-styles"
import { OverviewCard } from "@/features/dashboard/components/home/overview-card"
import { OverviewStats } from "@/features/dashboard/components/home/overview-stats"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  skeleton: {
    borderRadius: radius.xxl,
    height: "12rem",
  },
})

export function HomeOverview({ data }: { data: MyOverview | undefined }) {
  return (
    <section sx={homeStyles.section}>
      <h2 sx={homeStyles.sectionTitle}>{m.home_overview_yours()}</h2>
      {data === undefined ? (
        <div sx={homeStyles.grid}>
          <Skeleton sx={styles.skeleton} />
          <Skeleton sx={styles.skeleton} />
          <Skeleton sx={styles.skeleton} />
        </div>
      ) : (
        <div sx={homeStyles.grid}>
          <OverviewCard
            actions={
              <>
                <Button render={<Link to="/dashboard/upload" />} size="sm">
                  <Upload />
                  {m.dashboard_nav_upload()}
                </Button>
                <Button render={<Link to="/dashboard/submissions" />} size="sm" variant="ghost">
                  {m.dashboard_nav_submissions()}
                </Button>
              </>
            }
            icon={<Clock />}
            title={m.home_overview_chapters()}
          >
            <OverviewStats acceptedLabel={m.home_overview_approved()} counts={data.chapters} />
          </OverviewCard>
          <OverviewCard
            actions={
              <Button render={<Link to="/dashboard/my-suggestions" />} size="sm" variant="ghost">
                {m.dashboard_nav_my_suggestions()}
              </Button>
            }
            icon={<NoteEdit />}
            title={m.home_overview_suggestions()}
          >
            <OverviewStats acceptedLabel={m.home_overview_accepted()} counts={data.suggestions} />
          </OverviewCard>
          <OverviewCard
            actions={
              <>
                <Button render={<Link to="/dashboard/groups" />} size="sm" variant="ghost">
                  {m.dashboard_nav_my_groups()}
                </Button>
                <Button render={<Link to="/dashboard/invitations" />} size="sm" variant="ghost">
                  <Mail />
                  {m.dashboard_nav_invitations()}
                </Button>
              </>
            }
            icon={<Users />}
            title={m.dashboard_nav_groups()}
          >
            <dl sx={homeStyles.stats}>
              <div sx={homeStyles.stat}>
                <dt sx={homeStyles.statLabel}>{m.home_overview_groups()}</dt>
                <dd sx={homeStyles.statValue}>{data.groups}</dd>
              </div>
              <div sx={homeStyles.stat}>
                <dt sx={homeStyles.statLabel}>{m.home_overview_invitations()}</dt>
                <dd sx={homeStyles.statValue}>{data.invitations}</dd>
              </div>
            </dl>
          </OverviewCard>
        </div>
      )}
    </section>
  )
}

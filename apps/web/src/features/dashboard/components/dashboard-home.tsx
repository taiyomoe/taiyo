import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  CheckCircle,
  Clock,
  FileEdit,
  Mail,
  NoteEdit,
  Upload,
  UserCheck,
  Users,
} from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Card } from "@taiyomoe/ui/components/ui/card"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { sceneFont } from "@/components/scene/scene.stylex"
import { myOverviewQueryOptions } from "@/features/dashboard/api/my-overview"
import { DashboardIntro } from "@/features/dashboard/components/dashboard-intro"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  page: {
    gap: "2.5rem",
    paddingInline: {
      default: "1.25rem",
      "@media (width >= 48rem)": "2rem",
    },
    display: "flex",
    flexDirection: "column",
    maxWidth: "76rem",
    paddingBottom: "3rem",
    paddingTop: "2rem",
  },
  section: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  sectionTitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  grid: {
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))",
  },
  card: {
    padding: "1.5rem",
    gap: "1.25rem",
    minWidth: 0,
  },
  header: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
  },
  icon: {
    borderRadius: radius.lg,
    alignItems: "center",
    backgroundColor: colors.muted,
    color: colors.mutedForeground,
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
    height: "2.25rem",
    width: "2.25rem",
  },
  title: {
    margin: 0,
    flexGrow: 1,
    fontFamily: sceneFont.display,
    fontSize: "1.25rem",
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  stats: {
    margin: 0,
    gap: "0.5rem",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },
  stat: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column-reverse",
    minWidth: 0,
  },
  statValue: {
    margin: 0,
    fontSize: "1.75rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  statLabel: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
    marginTop: "auto",
  },
  queue: {
    padding: "1.25rem",
    gap: "1rem",
    textDecoration: "none",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  queueText: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  queueLabel: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
  skeleton: {
    borderRadius: radius.xxl,
    height: "12rem",
  },
})

type Counts = { pending: number; accepted: number; rejected: number }

function Stats({ counts, acceptedLabel }: { counts: Counts; acceptedLabel: string }) {
  return (
    <dl sx={styles.stats}>
      {[
        { label: m.home_overview_pending(), value: counts.pending },
        { label: acceptedLabel, value: counts.accepted },
        { label: m.home_overview_rejected(), value: counts.rejected },
      ].map((stat) => (
        <div key={stat.label} sx={styles.stat}>
          <dt sx={styles.statLabel}>{stat.label}</dt>
          <dd sx={styles.statValue}>{stat.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function OverviewCard({
  icon,
  title,
  children,
  actions,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
  actions: ReactNode
}) {
  return (
    <Card sx={styles.card}>
      <div sx={styles.header}>
        <span sx={styles.icon}>{icon}</span>
        <h3 sx={styles.title}>{title}</h3>
      </div>
      {children}
      <div sx={styles.actions}>{actions}</div>
    </Card>
  )
}

export function DashboardHome({ name }: { name: string }) {
  const { data } = useQuery(myOverviewQueryOptions)
  const queues =
    data === undefined
      ? []
      : [
          {
            key: "chapters",
            count: data.queues.chapters,
            label: m.dashboard_nav_chapter_reviews(),
            icon: <CheckCircle />,
            to: "/dashboard/chapter-reviews" as const,
          },
          {
            key: "suggestions",
            count: data.queues.suggestions,
            label: m.dashboard_nav_review_suggestions(),
            icon: <FileEdit />,
            to: "/dashboard/suggestions" as const,
          },
          {
            key: "groups",
            count: data.queues.groupRequests,
            label: m.dashboard_nav_ownership_requests(),
            icon: <UserCheck />,
            to: "/dashboard/group-requests" as const,
          },
        ].flatMap((queue) => (queue.count === null ? [] : [{ ...queue, count: queue.count }]))

  return (
    <div sx={styles.page}>
      <DashboardIntro name={name} subtitle={m.dashboard_personal_subtitle()} />
      {queues.length === 0 ? null : (
        <section sx={styles.section}>
          <h2 sx={styles.sectionTitle}>{m.home_overview_queues()}</h2>
          <div sx={styles.grid}>
            {queues.map((queue) => (
              <Card key={queue.key} render={<Link to={queue.to} />} sx={styles.queue}>
                <span sx={styles.icon}>{queue.icon}</span>
                <span sx={styles.queueText}>
                  <span sx={styles.statValue}>{queue.count}</span>
                  <span sx={styles.queueLabel}>{queue.label}</span>
                </span>
                {queue.count > 0 ? (
                  <Badge variant="warning">{m.home_overview_waiting()}</Badge>
                ) : null}
              </Card>
            ))}
          </div>
        </section>
      )}
      <section sx={styles.section}>
        <h2 sx={styles.sectionTitle}>{m.home_overview_yours()}</h2>
        {data === undefined ? (
          <div sx={styles.grid}>
            <Skeleton sx={styles.skeleton} />
            <Skeleton sx={styles.skeleton} />
            <Skeleton sx={styles.skeleton} />
          </div>
        ) : (
          <div sx={styles.grid}>
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
              <Stats acceptedLabel={m.home_overview_approved()} counts={data.chapters} />
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
              <Stats acceptedLabel={m.home_overview_accepted()} counts={data.suggestions} />
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
              <dl sx={styles.stats}>
                <div sx={styles.stat}>
                  <dt sx={styles.statLabel}>{m.home_overview_groups()}</dt>
                  <dd sx={styles.statValue}>{data.groups}</dd>
                </div>
                <div sx={styles.stat}>
                  <dt sx={styles.statLabel}>{m.home_overview_invitations()}</dt>
                  <dd sx={styles.statValue}>{data.invitations}</dd>
                </div>
              </dl>
            </OverviewCard>
          </div>
        )}
      </section>
    </div>
  )
}

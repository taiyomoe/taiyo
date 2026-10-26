import * as stylex from "@stylexjs/stylex"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { ClaimCard } from "@/features/groups/components/group-requests/claim-card"
import { CreationCard } from "@/features/groups/components/group-requests/creation-card"
import { RequestList } from "@/features/groups/components/group-requests/request-list"
import { api } from "@/lib/api"
import { unwrapEnvelope } from "@/lib/envelope"
import { m } from "@/paraglide/messages"

const REVIEW_PER_PAGE = 20
const styles = stylex.create({
  tabs: {
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
  },
  count: {
    color: colors.mutedForeground,
    fontVariantNumeric: "tabular-nums",
    marginInlineStart: "0.375rem",
  },
})

export function GroupRequestsPage() {
  const claims = useQuery({
    queryKey: ["ownership-requests", { page: 1 }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api["ownership-requests"].$get(
          { query: { page: "1", perPage: String(REVIEW_PER_PAGE) } },
          { init: { signal } },
        ),
      ),
  })
  const creations = useQuery({
    queryKey: ["group-creation-requests", { page: 1 }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api["group-creation-requests"].$get(
          { query: { page: "1", perPage: String(REVIEW_PER_PAGE) } },
          { init: { signal } },
        ),
      ),
  })

  return (
    <DashboardPage subtitle={m.review_subtitle()} title={m.review_title()}>
      <Tabs defaultValue="claims" sx={styles.tabs}>
        <TabsList variant="underline">
          <TabsTab value="claims">
            {m.review_tab_claims()}
            {claims.data === undefined ? null : (
              <span sx={styles.count}>{claims.data.meta.total}</span>
            )}
          </TabsTab>
          <TabsTab value="creations">
            {m.review_tab_new_groups()}
            {creations.data === undefined ? null : (
              <span sx={styles.count}>{creations.data.meta.total}</span>
            )}
          </TabsTab>
        </TabsList>
        <TabsPanel value="claims">
          <RequestList
            items={claims.data?.data}
            render={(request) => <ClaimCard key={request.id} request={request} />}
          />
        </TabsPanel>
        <TabsPanel value="creations">
          <RequestList
            items={creations.data?.data}
            render={(request) => <CreationCard key={request.id} request={request} />}
          />
        </TabsPanel>
      </Tabs>
    </DashboardPage>
  )
}

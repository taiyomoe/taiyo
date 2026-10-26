import { CheckCircle } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { Link } from "@tanstack/react-router"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { m } from "@/paraglide/messages"

type MediaEditSentProps = {
  mediaId: string
}

export function MediaEditSent({ mediaId }: MediaEditSentProps) {
  return (
    <DashboardPage title={m.media_edit_suggest_title()}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CheckCircle />
          </EmptyMedia>
          <EmptyTitle>{m.media_edit_sent_title()}</EmptyTitle>
          <EmptyDescription>{m.media_edit_sent_description()}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            render={<Link params={{ mediaId }} search={{ tab: "info" }} to="/media/$mediaId" />}
          >
            {m.media_edit_back()}
          </Button>
          <Button render={<Link to="/dashboard/my-suggestions" />} variant="outline">
            {m.dashboard_nav_my_suggestions()}
          </Button>
        </EmptyContent>
      </Empty>
    </DashboardPage>
  )
}

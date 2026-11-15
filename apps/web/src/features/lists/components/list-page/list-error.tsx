import { AlertCircle, List } from "@taiyomoe/ui/components/icons"
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
import { isNotFoundError } from "@/components/boundaries/not-found-page"
import { m } from "@/paraglide/messages"

export const isListNotFoundError = (error: unknown) => isNotFoundError(error, "LIST_NOT_FOUND")

function ListErrorState({ notFound }: { notFound: boolean }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">{notFound ? <List /> : <AlertCircle />}</EmptyMedia>
        <EmptyTitle>{notFound ? m.list_not_found_title() : m.error_heading()}</EmptyTitle>
        <EmptyDescription>
          {notFound ? m.list_not_found_description() : m.error_unknown()}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button render={<Link to="/lists" />} size="sm" variant="outline">
          {m.list_back()}
        </Button>
      </EmptyContent>
    </Empty>
  )
}

export function ListError({ error }: { error: unknown }) {
  return <ListErrorState notFound={isListNotFoundError(error)} />
}

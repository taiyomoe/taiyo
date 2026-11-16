import { getRouteApi, Link } from "@tanstack/react-router"
import { PagePagination } from "@/components/pagination/page-pagination"

const routeApi = getRouteApi("/library")

export function LibraryPagination({ page, pageCount }: { page: number; pageCount: number }) {
  const navigate = routeApi.useNavigate()
  const search = routeApi.useSearch()

  return (
    <PagePagination
      onJump={(target) => {
        void navigate({ search: { ...search, page: target === 1 ? undefined : target } })
      }}
      page={page}
      pageCount={pageCount}
      renderLink={(target) => (
        <Link search={{ ...search, page: target === 1 ? undefined : target }} to="/library" />
      )}
    />
  )
}

import { Pagination } from "@nextui-org/react"
import { PerPageDropdown } from "~/components/ui/pagination/per-page-dropdown"

type Props = {
  page: number
  perPage: number
  totalPages: number
  perPageChoices: number[]
  isLoading: boolean
  onPageChange: (newPage: number) => void
  onPerPageChange: (newPerPage: number) => void
}

export const TablePagination = ({
  page,
  perPage,
  totalPages,
  perPageChoices,
  isLoading,
  onPageChange,
  onPerPageChange,
}: Props) => {
  console.log("page", page, totalPages)

  return (
    <div className="flex gap-4">
      <PerPageDropdown
        perPage={perPage}
        choices={perPageChoices}
        isLoading={isLoading}
        renderOption={(o) => `${o} capítulos`}
        onChange={onPerPageChange}
      />
      <Pagination
        page={page}
        total={totalPages}
        onChange={onPageChange}
        color="primary"
        isDisabled={isLoading || totalPages === 1}
        showControls
        isCompact
      />
    </div>
  )
}

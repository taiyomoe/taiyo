import { Pagination } from "@nextui-org/pagination"
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
  return (
    <div className="flex flex-col items-center gap-4 md:flex-row">
      <PerPageDropdown
        perPage={perPage}
        choices={perPageChoices}
        isLoading={isLoading}
        isDisabled={totalPages === 0}
        renderOption={(o) => `${o} capítulos`}
        onChange={onPerPageChange}
      />
      <Pagination
        page={page}
        total={totalPages}
        onChange={onPageChange}
        color="primary"
        isDisabled={isLoading || totalPages < 2}
        showControls
        isCompact
      />
    </div>
  )
}

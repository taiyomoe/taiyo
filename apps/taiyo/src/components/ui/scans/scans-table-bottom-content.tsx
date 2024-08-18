import {} from "@nextui-org/dropdown"
import { Pagination } from "@nextui-org/react"
import { SCANS_LIST_PER_PAGE_CHOICES } from "@taiyomoe/constants"
import { useAtomValue } from "jotai"
import {} from "lucide-react"
import {
  scansListLoadingAtom,
  scansListSelectedKeysAtom,
} from "~/atoms/scansList.atoms"
import { PerPageDropdown } from "~/components/ui/pagination/per-page-dropdown"
import { useScansList } from "~/hooks/useScansList"

export const ScansTableBottomContent = () => {
  const selectedKeys = useAtomValue(scansListSelectedKeysAtom)
  const isLoading = useAtomValue(scansListLoadingAtom)
  const {
    items,
    page,
    perPage,
    totalPages,
    handlePageChange,
    handlePerPageChange,
  } = useScansList()

  return (
    <div className="flex items-center justify-between">
      <span className="hidden text-default-400 text-small sm:block">
        {selectedKeys === "all"
          ? "Todos as scans selecionadas"
          : ` Scans ${selectedKeys.size} de ${items.length} selecionadas`}
      </span>
      <div className="flex gap-4">
        <PerPageDropdown
          defaultChoice={perPage}
          choices={SCANS_LIST_PER_PAGE_CHOICES}
          renderOption={(o) => `${o} scans`}
          onChange={handlePerPageChange}
        />
        <Pagination
          initialPage={page}
          total={totalPages}
          color="primary"
          onChange={handlePageChange}
          showControls
          showShadow
          isDisabled={isLoading || totalPages === 1}
          isCompact
        />
      </div>
    </div>
  )
}

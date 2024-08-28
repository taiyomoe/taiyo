import { ScansFilter } from "~/components/ui/filters/scans-filter"
import { useChaptersList } from "~/hooks/useChaptersList"

export const ChaptersTableFilters = () => {
  const { scanIds, handleFilterChange } = useChaptersList()

  return (
    <div>
      <ScansFilter
        scanIds={scanIds}
        setScanIds={handleFilterChange("scanIds")}
      />
    </div>
  )
}

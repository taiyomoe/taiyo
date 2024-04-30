"use client"

import { Divider } from "@nextui-org/divider"
import type { MediaChapterWithScans } from "@taiyomoe/types"
import { useAtomValue } from "jotai"
import { bulkEditChaptersActiveTabAtom } from "~/atoms/bulkEditChapters.atoms"
import { BulkUpdateChapterScansForm } from "~/components/forms/chapters/bulk-update-scans/BulkUpdateChapterScansForm"
import { BulkUpdateChapterVolumesForm } from "~/components/forms/chapters/bulk-update-volumes/BulkUpdateChapterVolumesForm"
import { useDevice } from "~/hooks/useDevice"
import { BulkUpdateChaptersActionsTabsButtons } from "./bulk-update-chapters-actions-tabs-buttons"

type Props = {
  chapters: MediaChapterWithScans[]
}

export const BulkUpdateChaptersActionsTabs = ({ chapters }: Props) => {
  const activeTab = useAtomValue(bulkEditChaptersActiveTabAtom)
  const { isAboveTablet } = useDevice()

  if (!isAboveTablet) {
    return <p>Esta página não está disponível para mobile.</p>
  }

  return (
    <div className="flex h-full gap-8">
      <BulkUpdateChaptersActionsTabsButtons />
      <Divider orientation="vertical" className="h-auto" />
      <div className="flex w-full flex-col gap-4">
        {activeTab === "volumes" && (
          <BulkUpdateChapterVolumesForm chapters={chapters} />
        )}
        {activeTab === "scans" && (
          <BulkUpdateChapterScansForm chapters={chapters} />
        )}
      </div>
    </div>
  )
}

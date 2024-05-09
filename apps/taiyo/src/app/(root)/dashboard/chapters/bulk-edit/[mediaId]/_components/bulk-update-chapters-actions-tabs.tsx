"use client"

import { Divider } from "@nextui-org/divider"
import type { MediaChapterWithScans } from "@taiyomoe/types"
import { useAtomValue } from "jotai"
import { bulkEditChaptersActiveTabAtom } from "~/atoms/bulkEditChapters.atoms"
import { BulkUpdateChaptersScansForm } from "~/components/forms/chapters/bulk-update-scans/bulk-update-chapters-scans-form"
import { BulkUpdateChaptersVolumesForm } from "~/components/forms/chapters/bulk-update-volumes/bulk-update-chapters-volumes-form"
import { BulkUpdateChaptersActionsTabsButtons } from "./bulk-update-chapters-actions-tabs-buttons"
import { BulkUpdateChaptersSummary } from "./bulk-update-chapters-summary"

type Props = {
  chapters: MediaChapterWithScans[]
}

export const BulkUpdateChaptersActionsTabs = ({ chapters }: Props) => {
  const activeTab = useAtomValue(bulkEditChaptersActiveTabAtom)

  return (
    <div className="flex h-full flex-col gap-8 md:flex-row">
      <BulkUpdateChaptersActionsTabsButtons />
      <Divider orientation="vertical" className="hidden h-auto md:block" />
      <Divider className="block w-auto md:hidden" />
      <div className="flex w-full flex-col gap-10">
        <BulkUpdateChaptersSummary type={activeTab} chapters={chapters} />
        {activeTab === "volumes" && (
          <BulkUpdateChaptersVolumesForm chapters={chapters} />
        )}
        {activeTab === "scans" && (
          <BulkUpdateChaptersScansForm chapters={chapters} />
        )}
      </div>
    </div>
  )
}

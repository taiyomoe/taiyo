import { useAtom } from "jotai"
import { bulkEditChaptersActiveTabAtom } from "~/atoms/bulkEditChapters.atoms"

export const BulkUpdateChaptersActionsTabsButtons = () => {
  const [activeTab, setActiveTab] = useAtom(bulkEditChaptersActiveTabAtom)
  const actions = ["volumes", "scans"] as const

  return (
    <div className="flex min-w-24 flex-col gap-4">
      {actions.map((action) => (
        <button
          key={action}
          className="!duration-150 before:-mt-[2px] before:-ml-3 rounded-small px-3 py-1.5 text-left transition-background before:absolute data-[active=true]:before:h-7 before:w-1 disabled:cursor-default before:rounded-r-small before:bg-primary data-[active=false]:hover:bg-default-200"
          onClick={() => setActiveTab(action)}
          disabled={activeTab === action}
          type="button"
          data-active={activeTab === action}
        >
          {action === "volumes" ? "Volumes" : "Scans"}
        </button>
      ))}
    </div>
  )
}

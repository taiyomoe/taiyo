import { Tab, Tabs } from "@nextui-org/react"

import { UserLibrarySidebarTabsContent } from "~/components/library/UserLibrarySidebarTabsContent"
import { LibraryUtils } from "~/lib/utils/library.utils"

export const UserLibrarySidebarTabs = () => {
  return (
    <Tabs
      classNames={{
        tabList: "p-0",
      }}
      radius="sm"
      variant="light"
      color="primary"
    >
      <Tab key="reading" title={LibraryUtils.getStatusLabel("reading")}>
        <UserLibrarySidebarTabsContent status="reading" />
      </Tab>
      <Tab key="rereading" title={LibraryUtils.getStatusLabel("rereading")}>
        <UserLibrarySidebarTabsContent status="rereading" />
      </Tab>
      <Tab key="completed" title={LibraryUtils.getStatusLabel("completed")}>
        <UserLibrarySidebarTabsContent status="completed" />
      </Tab>
      <Tab key="onHold" title={LibraryUtils.getStatusLabel("onHold")}>
        <UserLibrarySidebarTabsContent status="onHold" />
      </Tab>
      <Tab key="dropped" title={LibraryUtils.getStatusLabel("dropped")}>
        <UserLibrarySidebarTabsContent status="dropped" />
      </Tab>
      <Tab key="planToRead" title={LibraryUtils.getStatusLabel("planToRead")}>
        <UserLibrarySidebarTabsContent status="planToRead" />
      </Tab>
    </Tabs>
  )
}

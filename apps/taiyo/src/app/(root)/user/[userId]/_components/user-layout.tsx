import type { User } from "@taiyomoe/db"
import { UserLayoutAvatar } from "./user-layout-avatar"
import { UserLayoutBanner } from "./user-layout-banner"
import { UserLayoutFollow } from "./user-layout-follow"
import { UserLayoutUsername } from "./user-layout-username"

type Props = {
  user: User
}

export const UserLayout = ({ user }: Props) => {
  return (
    <main className="h-full">
      <UserLayoutBanner user={user} />
      <div className="-mt-[101px] relative z-10 flex flex-col gap-bodyPadding p-bodyPadding pt-0 sm:flex-row">
        <UserLayoutAvatar user={user} />
        <div className="flex w-full max-w-[calc(100vw-206px-(var(--body-padding)*3))] flex-col gap-[3px]">
          <div className="flex h-[102px] w-full items-center justify-between gap-bodyPadding">
            <UserLayoutUsername user={user} />
            <UserLayoutFollow user={user} />
          </div>
          {/* <UserLayoutTabs user={user} /> */}
        </div>
      </div>
    </main>
  )
}

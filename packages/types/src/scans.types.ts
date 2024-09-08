import type { Scan, User } from "@prisma/client"

export type ScansListItem = Omit<Scan, "creatorId" | "deleterId"> & {
  creator: Pick<User, "id" | "name" | "image">
  deleter: Pick<User, "id" | "name" | "image"> | null
  chaptersCount: number
}

export type LimitedScan = Omit<
  Scan,
  "createdAt" | "updatedAt" | "deletedAt" | "creatorId" | "deleterId"
>

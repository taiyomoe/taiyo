import type { Scan } from "@prisma/client"

export type ScansListItem = Pick<Scan, "id" | "name"> & {
  chapters: number
  members: number
}

export type LimitedScan = Omit<
  Scan,
  "createdAt" | "updatedAt" | "deletedAt" | "creatorId" | "deleterId"
>

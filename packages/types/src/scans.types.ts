import type { Scan } from "@prisma/client"

export type ScansList = {
  id: string
  name: string
  chapters: number
  members: number
}[]

export type LimitedScan = Omit<
  Scan,
  "createdAt" | "updatedAt" | "deletedAt" | "creatorId" | "deleterId"
>

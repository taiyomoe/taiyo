import type { MediaTitle } from "@prisma/client"

export type NewTitle = Pick<
  MediaTitle,
  "title" | "language" | "isMainTitle" | "priority"
>

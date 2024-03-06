export type Resource =
  | "trackers"
  | "medias"
  | "mediaTitles"
  | "mediaBanners"
  | "mediaCovers"
  | "mediaChapters"
  | "mediaChapterComments"
  | "history"
  | "library"
  | "scans"
  | "scanMembers"

export type Action = "create" | "update" | "delete" // read is omitted
type Possession = "any" | "own"

export type Permission = [Resource | Resource[], Action | Action[], Possession?]

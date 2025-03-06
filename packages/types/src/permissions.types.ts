export type Resources =
  | "trackers"
  | "medias"
  | "mediaTitles"
  | "mediaBanners"
  | "mediaCovers"
  | "mediaChapters"
  | "history"
  | "library"
  | "scans"
  | "usersFollow"
  | "usersSettings"

export type Posession = "any" | "own"
export type ResourcesWithPossession = Exclude<
  Resources,
  "usersFollow" | "usersSettings"
>
export type ResourcesWithoutPossession = Extract<
  Resources,
  "usersFollow" | "usersSettings"
>

export type Actions = "create" | "update" | "delete" // read is omitted
type ActionsWithoutCreate = Exclude<Actions, "create">

export type Permission =
  | `${Resources}:create`
  | `${ResourcesWithoutPossession}:${ActionsWithoutCreate}`
  | `${ResourcesWithPossession}:${ActionsWithoutCreate}:${Posession}`

export type ForgedPermission = [
  Resources | Resources[],
  Actions | Actions[],
  Posession?,
]

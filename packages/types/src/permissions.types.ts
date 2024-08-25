export type Resources =
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
  | "usersFollow"
  | "usersSettings"

export type Posession = "any" | "own"
export type ResourcesWithPossession = Exclude<Resources, "scanMembers">
export type ResourcesWithoutPossession = Extract<
  Resources,
  "scanMembers" | "usersFollow" | "usersSettings"
>

export type Actions = "create" | "update" | "delete" // read is omitted
type ActionsWithoutCreate = Exclude<Actions, "create">

export type Permission =
  | `${Resources}:create`
  | `${ResourcesWithoutPossession}:${ActionsWithoutCreate}`
  | `${ResourcesWithPossession}:${ActionsWithoutCreate}:${Posession}`

export type Grant = {
  role: string
  resource: Resources
  action: `${Actions}:${"any" | "own"}`
}

export type ForgedPermission = [
  Resources | Resources[],
  Actions | Actions[],
  Posession?,
]

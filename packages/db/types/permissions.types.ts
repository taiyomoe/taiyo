export type Resources =
  | "tags"
  | "trackers"
  | "medias"
  | "mediaTags"
  | "mediaTitles"
  | "mediaBanners"
  | "mediaCovers"
  | "mediaChapters"
  | "mediaChapterComments"
  | "scans"
  | "scanMembers";

export type Posession = "any" | "own";
export type ResourcesWithPossession = Exclude<Resources, "scanMembers">;
export type ResourcesWithoutPossession = Extract<Resources, "scanMembers">;

export type Actions = "create" | "update" | "delete"; // read is omitted
type ActionsWithoutCreate = Exclude<Actions, "create">;

export type Permission =
  | `${Resources}:create`
  | `${ResourcesWithoutPossession}:${ActionsWithoutCreate}`
  | `${ResourcesWithPossession}:${ActionsWithoutCreate}:${Posession}`;

export type RefinedPermission = {
  resource: Resources;
  action: Actions;
  posession?: Posession;
};

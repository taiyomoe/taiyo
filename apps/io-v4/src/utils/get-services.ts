import * as rawServices from "@taiyomoe/services"

export const services = {
  medias: rawServices.MediasService,
  covers: rawServices.CoversService,
  chapters: rawServices.ChaptersService,
  users: rawServices.UsersService,
  libraries: rawServices.LibrariesService,
  titles: rawServices.TitlesService,
  trackers: rawServices.TrackersService,
}

export type ContextServices = typeof services

import * as rawServices from "@taiyomoe/services"

export const services = {
  medias: rawServices.MediasService,
  covers: rawServices.BaseCoversService,
  chapters: rawServices.ChaptersService,
  users: rawServices.BaseUsersService,
  titles: rawServices.BaseTitlesService,
  trackers: rawServices.BaseTrackersService,
}

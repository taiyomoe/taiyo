import * as rawServices from "@taiyomoe/services"

export const services = {
  covers: rawServices.BaseCoversService,
  chapters: rawServices.ChaptersService,
  users: rawServices.BaseUsersService,
  titles: rawServices.BaseTitlesService,
  trackers: rawServices.BaseTrackersService,
}

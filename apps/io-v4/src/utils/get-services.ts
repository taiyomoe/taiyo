import * as rawServices from "@taiyomoe/services"

export const services = {
  chapters: rawServices.BaseChaptersService,
  covers: rawServices.BaseCoversService,
  titles: rawServices.BaseTitlesService,
  users: rawServices.BaseUsersService,
}

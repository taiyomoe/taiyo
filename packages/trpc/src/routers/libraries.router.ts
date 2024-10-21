import { getUserLibraryHandler } from "../handlers/get-user-library.handler"
import { updateUserLibraryHandler } from "../handlers/update-user-library.handler"
import { createTRPCRouter } from "../trpc"

export const librariesRouter = createTRPCRouter({
  getLibrary: getUserLibraryHandler,
  updateLibrary: updateUserLibraryHandler,
})

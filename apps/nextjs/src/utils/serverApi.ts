import { appRouter } from "@taiyo/api";
import { db } from "@taiyo/db";

export const serverApi = appRouter.createCaller({
  db,
  session: null,
});

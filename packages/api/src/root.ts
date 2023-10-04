import { mediasRouter } from "./router/medias";
import { tagsRouter } from "./router/tags";
import { usersRouter } from "./router/users";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  tags: tagsRouter,
  users: usersRouter,
  medias: mediasRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

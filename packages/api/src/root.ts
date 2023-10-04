import { mediasRouter } from "./router/medias";
import { usersRouter } from "./router/users";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  users: usersRouter,
  medias: mediasRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

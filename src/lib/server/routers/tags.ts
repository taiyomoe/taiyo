import { insertTagSchema } from "~/lib/schemas";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const tagsRouter = createTRPCRouter({
  add: protectedProcedure
    .meta({ resource: "tags", action: "create" })
    .input(insertTagSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.tag.create({
        data: {
          ...input,
          creatorId: ctx.session.user.id,
        },
      });

      return result;
    }),
});

import { tags } from "@taiyo/db/schema/tags";
import { insertTagSchema } from "@taiyo/db/types";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const tagsRouter = createTRPCRouter({
  add: protectedProcedure
    .meta({ resource: "tags", action: "create" })
    .input(insertTagSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(tags)
        .values({
          ...input,
          creatorId: ctx.session.user.id,
        })
        .returning()
        .execute();

      return result.at(0)!;
    }),
});

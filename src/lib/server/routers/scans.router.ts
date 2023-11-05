import { insertScanSchema } from "~/lib/schemas";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const scansRouter = createTRPCRouter({
  add: protectedProcedure
    .meta({ resource: "scans", action: "create" })
    .input(insertScanSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.scan.create({
        data: {
          ...input,
          creatorId: ctx.session.user.id,
        },
      });

      return result;
    }),
});

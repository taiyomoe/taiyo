import { insertScanSchema, searchScanSchema } from "~/lib/schemas";
import { ScanService } from "~/lib/services/scan.service";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const scansRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({ resource: "scans", action: "create" })
    .input(insertScanSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.scan.create({
        data: {
          ...input,
          creatorId: ctx.session.user.id,
        },
      });

      const indexItem = await ScanService.getIndexItem(result.id);
      await ctx.indexes.scans.updateDocuments([indexItem]);

      return result;
    }),

  search: protectedProcedure
    .meta({ resource: "scans", action: "create" })
    .input(searchScanSchema)
    .mutation(async ({ ctx, input }) => {
      const results = await ctx.indexes.scans.search(input);
      return results.hits;
    }),
});

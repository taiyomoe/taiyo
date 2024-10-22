import { bulkMutateScansHandler } from "../handlers/bulk-mutate-scans.handler"
import { createScanHandler } from "../handlers/create-scan.handler"
import { getScansListHandler } from "../handlers/get-scans-list.handler"
import { updateScanHandler } from "../handlers/update-scan.handler"
import { createTRPCRouter } from "../trpc"

export const scansRouter = createTRPCRouter({
  create: createScanHandler,
  update: updateScanHandler,
  bulkMutate: bulkMutateScansHandler,
  getList: getScansListHandler,
})

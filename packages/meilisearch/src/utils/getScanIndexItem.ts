import type { PrismaClient } from "@prisma/client"
import type { ScansIndexItem } from "@taiyomoe/types"
import { TRPCError } from "@trpc/server"

/**
 * Gets the name of a scan.
 * This is used to populate the Meilisearch titles index.
 */
export const getScanIndexItem = async (
  db: PrismaClient,
  scanId: string,
): Promise<ScansIndexItem> => {
  const result = await db.scan.findUnique({
    select: { id: true, name: true },
    where: { id: scanId },
  })

  if (!result) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Scan '${scanId}' not found`,
    })
  }

  return result
}

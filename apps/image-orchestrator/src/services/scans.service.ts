import { Injectable, NotFoundException } from "@nestjs/common"
import type { PrismaService } from "./prisma.service"

@Injectable()
export class ScansService {
  constructor(private prisma: PrismaService) {}

  async getByIds(ids: string[]) {
    const result = await this.prisma.scan.findMany({
      where: { id: { in: ids } },
    })

    if (result.length !== ids.length) {
      throw new NotFoundException("One or more scans were not found.")
    }

    return result
  }
}

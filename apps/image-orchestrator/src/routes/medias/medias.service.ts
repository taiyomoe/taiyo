import { NotFoundException } from "@nestjs/common"

import { PrismaService } from "~/services"

export class MediasService {
  constructor(private prisma: PrismaService) {}

  async getById(id: string) {
    const result = await this.prisma.media.findUnique({ where: { id } })

    if (!result) {
      throw new NotFoundException("Media not found.")
    }

    return result
  }
}

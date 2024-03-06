import { Injectable } from "@nestjs/common"

import { UploadedResource } from "~/types"

import { randomUUID } from "crypto"
import { FilesService, PrismaService } from "~/services"
import { UploadChapterDto } from "./dto/upload-chapter.dto"

@Injectable()
export class ChaptersService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
  ) {}

  async insert({ scanIds, ...input }: UploadChapterDto, res: UploadedResource, uploaderId: string) {
    const result = await this.prisma.mediaChapter.create({
      data: {
        ...input,
        id: res.id,
        pages: res.files,
        language: "pt_br",
        Scan: { connect: scanIds.map((id) => ({ id })) },
        uploaderId,
      },
    })

    return result
  }

  async upload(mediaId: string, files: Express.Multer.File[]): Promise<UploadedResource> {
    const id = randomUUID()
    const uploaded = await this.filesService.uploadFiles(`medias/${mediaId}/chapters/${id}`, files)

    return { id, files: uploaded }
  }
}

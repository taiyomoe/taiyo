import { Injectable } from "@nestjs/common"

import { FilesService, PrismaService } from "~/services"
import { UploadedFile } from "~/types"

import { UploadBannerDto } from "./dto/upload-banner.dto"

@Injectable()
export class BannersService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
  ) {}

  async insert(input: UploadBannerDto, file: UploadedFile, uploaderId: string) {
    const result = await this.prisma.mediaBanner.create({
      data: {
        ...input,
        id: file.id,
        uploaderId,
      },
    })

    return result
  }

  async upload(mediaId: string, files: Express.Multer.File[]): Promise<UploadedFile> {
    const [uploaded] = await this.filesService.uploadFiles(`medias/${mediaId}/banners`, files)

    return uploaded
  }
}

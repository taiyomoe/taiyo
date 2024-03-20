import { Injectable } from "@nestjs/common"
import type { FilesService, PrismaService } from "~/services"
import type { UploadedFile } from "~/types"
import type { UploadBannerDto } from "./dto/upload-banner.dto"

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

  async upload(mediaId: string, files: Express.Multer.File[]) {
    const uploaded = await this.filesService.uploadFiles(`medias/${mediaId}/banners`, files)

    return uploaded
  }
}

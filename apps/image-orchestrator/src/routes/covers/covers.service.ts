import { Injectable } from "@nestjs/common"
import { FilesService, PrismaService } from "~/services"
import { UploadedFile } from "~/types"
import { UploadCoverDto } from "./dto/upload-cover.dto"

@Injectable()
export class CoversService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
  ) {}

  async insert(input: UploadCoverDto, file: UploadedFile, uploaderId: string) {
    const result = await this.prisma.mediaCover.create({
      data: {
        ...input,
        id: file.id,
        uploaderId,
      },
    })

    return result
  }

  async upload(mediaId: string, files: Express.Multer.File[]): Promise<UploadedFile> {
    const [uploaded] = await this.filesService.uploadFiles(`medias/${mediaId}/covers`, files)

    return uploaded!
  }

  async uploadFromUrl(
    mediaId: string,
    url: string,
    options: { onDownload?: () => void; onUpload?: () => void },
  ): Promise<UploadedFile> {
    options.onDownload?.()

    const file = await fetch(url).then((res) => res.arrayBuffer())

    options.onUpload?.()

    const [uploaded] = await this.filesService.uploadFiles(`medias/${mediaId}/covers`, [file])

    return uploaded!
  }
}

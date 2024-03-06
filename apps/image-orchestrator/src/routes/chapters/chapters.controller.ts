import {
  Body,
  Controller,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common"
import { FilesInterceptor } from "@nestjs/platform-express"
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiTags } from "@nestjs/swagger"
import { ApiResponse, Permissions, User } from "~/decorators"
import { MediasService } from "~/routes/medias/medias.service"
import { SessionUser } from "~/schemas"
import { ScansService } from "~/services"
import { FileTypeValidator } from "~/validators/fileType.validator"
import { ChaptersService } from "./chapters.service"
import { MediaChapterDto } from "./dto/media-chapter.dto"
import { UploadChapterDto } from "./dto/upload-chapter.dto"

@ApiCookieAuth()
@ApiTags("chapters")
@Controller("chapters")
export class ChaptersController {
  constructor(
    private readonly chaptersService: ChaptersService,
    private readonly mediasService: MediasService,
    private readonly scansService: ScansService,
  ) {}

  @Post("upload")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Upload a chapter.",
    type: UploadChapterDto,
  })
  @ApiResponse(MediaChapterDto)
  @UseInterceptors(FilesInterceptor("files", 100))
  @Permissions([["mediaChapters", "create"]])
  async upload(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024,
            message: "File too large. Max: 10MB.",
          }),
          new FileTypeValidator(["image/jpeg", "image/png", "image/webp", "image/gif"]),
        ],
      }),
    )
    files: Express.Multer.File[],
    @Body() dto: UploadChapterDto,
    @User() uploader: SessionUser,
  ) {
    const media = await this.mediasService.getById(dto.mediaId)

    await this.scansService.getByIds(dto.scanIds)

    const uploadedChapter = await this.chaptersService.upload(media.id, files)
    const chapter = await this.chaptersService.insert(dto, uploadedChapter, uploader.id)

    return chapter
  }
}

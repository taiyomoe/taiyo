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
import type { MediasService } from "~/routes/medias/medias.service"
import type { SessionUser } from "~/schemas"
import { FileTypeValidator } from "~/validators/fileType.validator"
import type { CoversService } from "./covers.service"
import { MediaCoverDto } from "./dto/media-cover.dto"
import { UploadCoverDto } from "./dto/upload-cover.dto"

@ApiCookieAuth()
@ApiTags("covers")
@Controller("covers")
export class CoversController {
  constructor(
    private readonly coversService: CoversService,
    private readonly mediasService: MediasService,
  ) {}

  @Post("upload")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Upload a cover.",
    type: UploadCoverDto,
  })
  @ApiResponse(MediaCoverDto)
  @UseInterceptors(FilesInterceptor("file", 1))
  @Permissions([["mediaCovers", "create"]])
  async upload(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024,
            message: "File too large. Max: 10MB.",
          }),
          new FileTypeValidator(["image/jpeg", "image/png", "image/webp"]),
        ],
      }),
    )
    [file]: Express.Multer.File[],
    @Body() dto: UploadCoverDto,
    @User() uploader: SessionUser,
  ) {
    const media = await this.mediasService.getById(dto.mediaId)

    const [uploadedFile] = await this.coversService.upload(media.id, [file!])
    const cover = await this.coversService.insert(dto, uploadedFile!, uploader.id)

    return cover
  }
}

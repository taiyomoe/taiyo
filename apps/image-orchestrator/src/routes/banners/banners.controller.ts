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
import { FileTypeValidator } from "~/validators/fileType.validator"
import { BannersService } from "./banners.service"
import { MediaBannerDto } from "./dto/media-banner.dto"
import { UploadBannerDto } from "./dto/upload-banner.dto"

@ApiCookieAuth()
@ApiTags("banners")
@Controller("banners")
export class BannersController {
  constructor(
    private readonly bannersService: BannersService,
    private readonly mediasService: MediasService,
  ) {}

  @Post("upload")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Upload a banner.",
    type: UploadBannerDto,
  })
  @ApiResponse(MediaBannerDto)
  @UseInterceptors(FilesInterceptor("file", 1))
  @Permissions([["mediaBanners", "create"]])
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
    @Body() dto: UploadBannerDto,
    @User() uploader: SessionUser,
  ) {
    const media = await this.mediasService.getById(dto.mediaId)

    const [uploadedFile] = await this.bannersService.upload(media.id, [file!])
    const banner = await this.bannersService.insert(dto, uploadedFile!, uploader.id)

    return banner
  }
}

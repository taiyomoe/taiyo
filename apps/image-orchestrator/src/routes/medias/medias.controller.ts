import { Controller, Query, Sse } from "@nestjs/common"
import type { EventEmitter2 } from "@nestjs/event-emitter"
import { ApiBody, ApiCookieAuth, ApiTags } from "@nestjs/swagger"
import { fromEvent, map } from "rxjs"
import { ApiResponse, Permissions, User } from "~/decorators"
import type { SessionUser } from "~/schemas"
import type { MdService } from "~/services"
import { ImportMediaDto } from "./dto/import-media.dto"
import { MediaDto } from "./dto/media.dto"

@ApiCookieAuth()
@ApiTags("medias")
@Controller("medias")
export class MediasController {
  constructor(
    private readonly mdService: MdService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Sse("import")
  @ApiBody({
    description: "Import a media page from MangaDex.",
    type: ImportMediaDto,
  })
  @ApiResponse(MediaDto)
  @Permissions([["medias", "create"]])
  async upload(@Query() dto: ImportMediaDto, @User() creator: SessionUser) {
    void this.mdService.import(dto, creator.id)

    return fromEvent(this.eventEmitter, this.mdService.importEventKey).pipe(map((d) => d))
  }
}

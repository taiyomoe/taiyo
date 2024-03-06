import { Module } from "@nestjs/common"
import { CoversModule } from "~/routes/covers/covers.module"
import { FilesService, MdService, PrismaService } from "~/services"
import { MediasController } from "./medias.controller"
import { MediasService } from "./medias.service"

@Module({
  controllers: [MediasController],
  providers: [MediasService, MdService, FilesService, PrismaService],
  imports: [CoversModule],
  exports: [MediasService],
})
export class MediasModule {}

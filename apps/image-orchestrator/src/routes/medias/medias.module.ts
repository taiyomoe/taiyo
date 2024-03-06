import { Module } from "@nestjs/common"

import { FilesService, MdService, PrismaService } from "~/services"

import { CoversModule } from "~/routes/covers/covers.module"
import { MediasController } from "./medias.controller"
import { MediasService } from "./medias.service"

@Module({
  controllers: [MediasController],
  providers: [MediasService, MdService, FilesService, PrismaService],
  imports: [CoversModule],
  exports: [MediasService],
})
export class MediasModule {}

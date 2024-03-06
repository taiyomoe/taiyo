import { Module } from "@nestjs/common"

import { MediasService } from "~/routes/medias/medias.service"
import { FilesService, PrismaService, ScansService } from "~/services"

import { ChaptersController } from "./chapters.controller"
import { ChaptersService } from "./chapters.service"

@Module({
  controllers: [ChaptersController],
  providers: [ChaptersService, MediasService, ScansService, FilesService, PrismaService],
})
export class ChaptersModule {}

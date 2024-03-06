import { Test, TestingModule } from "@nestjs/testing"
import { ChaptersService } from "../chapters.service"

describe("ChaptersService", () => {
  let service: ChaptersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChaptersService],
    }).compile()

    service = module.get<ChaptersService>(ChaptersService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})

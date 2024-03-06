import { Test, TestingModule } from "@nestjs/testing"
import { BannersController } from "../banners.controller"
import { BannersService } from "../banners.service"

describe("BannersController", () => {
  let controller: BannersController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannersController],
      providers: [BannersService],
    }).compile()

    controller = module.get<BannersController>(BannersController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})

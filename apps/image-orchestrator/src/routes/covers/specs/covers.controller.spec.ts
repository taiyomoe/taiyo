import { Test, TestingModule } from "@nestjs/testing"
import { CoversController } from "../covers.controller"
import { CoversService } from "../covers.service"

describe("CoversController", () => {
  let controller: CoversController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoversController],
      providers: [CoversService],
    }).compile()

    controller = module.get<CoversController>(CoversController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})

import { Test, TestingModule } from "@nestjs/testing"
import { CoversService } from "../covers.service"

describe("CoversService", () => {
  let service: CoversService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoversService],
    }).compile()

    service = module.get<CoversService>(CoversService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})

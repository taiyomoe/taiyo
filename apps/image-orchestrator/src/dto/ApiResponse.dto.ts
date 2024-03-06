import { ApiProperty } from "@nestjs/swagger"

export class ApiResponseDto<TData, TMeta> {
  @ApiProperty()
  data: TData

  @ApiProperty()
  meta: TMeta

  @ApiProperty()
  statusCode: number
}

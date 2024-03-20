import { type Type, applyDecorators } from "@nestjs/common"
import { ApiCreatedResponse, ApiExtraModels, getSchemaPath } from "@nestjs/swagger"
import { ApiResponseDto } from "~/dto"

export const ApiResponse = <TModel extends Type<unknown>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(ApiResponseDto, model),
    ApiCreatedResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          { properties: { data: { $ref: getSchemaPath(model) } } },
        ],
      },
    }),
  )
}

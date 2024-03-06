import { createZodDto } from "nestjs-zod"
import { z } from "nestjs-zod/z"

const importMediaSchema = z.object({
  mdId: z.string().uuid(),
  synopsis: z.string().min(1),
})

export class ImportMediaDto extends createZodDto(importMediaSchema) {}

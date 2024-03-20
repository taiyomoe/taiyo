import { Reflector } from "@nestjs/core"
import type { ForgedPermission } from "@taiyomoe/types"

export const Permissions = Reflector.createDecorator<ForgedPermission[]>()

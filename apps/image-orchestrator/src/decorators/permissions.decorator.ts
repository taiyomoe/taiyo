import { Reflector } from "@nestjs/core"
import { ForgedPermission } from "@taiyomoe/types"

export const Permissions = Reflector.createDecorator<ForgedPermission[]>()

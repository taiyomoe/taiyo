import { Reflector } from "@nestjs/core"

import { Permission } from "~/types/permissions.types"

export const Permissions = Reflector.createDecorator<Permission[]>()

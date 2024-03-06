import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"

import { Permissions } from "~/decorators"
import { sessionSchema } from "~/schemas"
import { PermissionUtils } from "~/utils/PermissionUtils"

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get(Permissions, context.getHandler())

    if (!requiredPermissions) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const session = await fetch("http://localhost:3000/api/auth/session", {
      headers: { Cookie: request.headers.cookie },
    })
      .then(async (res) => {
        const session = await res.json()
        const parsedSession = sessionSchema.parse(session)

        return parsedSession
      })
      .catch(() => null)

    if (!session) return false

    request.user = session.user

    return PermissionUtils.hasPermission(session.user.role.permissions, requiredPermissions)
  }
}

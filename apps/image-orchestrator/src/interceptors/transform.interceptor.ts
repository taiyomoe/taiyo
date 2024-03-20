import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from "@nestjs/common"
import type { Observable } from "rxjs"
import { map } from "rxjs/operators"

export interface Response {
  data: null
  meta: unknown[]
  statusCode: number
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response> {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<Response> {
    return next.handle().pipe(
      map((returned) => {
        const data = (Array.isArray(returned) ? returned?.at(0) : returned) || null
        const meta = Array.isArray(returned) ? [returned.at(1)] : []
        const statusCode = ctx.switchToHttp().getResponse().statusCode

        return {
          data,
          meta,
          statusCode,
        }
      }),
    )
  }
}

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"

export interface Response<T> {
  data: null
  meta: []
  statusCode: number
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((returned) => {
        const data = (Array.isArray(returned) ? returned?.at(0) : returned) || null
        const meta = Array.isArray(returned) ? returned.at(1) : {}
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

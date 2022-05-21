import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApplyTokenInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!request.url.includes('api/')) {
      return next.handle(request);
    }

    if (localStorage.getItem('accessToken')) {
      const authRequest = request.clone({
        headers: request.headers.set(
          'Authorization',
          `Bearer ${localStorage.getItem('accessToken') || ''}`
        ),
      });

      return next.handle(authRequest);
    }

    return next.handle(request);
  }
}

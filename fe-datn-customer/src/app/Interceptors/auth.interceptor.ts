import { HttpEvent, HttpInterceptorFn, HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthServiceService } from '../Service/auth-service.service';
import { Router } from '@angular/router';

const TOKEN_HEADER_KEY = 'Authorization';

export const authInterceptorFn: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthServiceService);
  const router = inject(Router);

  let authReq = req;
  const token = authService.getToken();
  if (token != null) {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error instanceof HttpErrorResponse && !authReq.url.includes('auth/signin') && error.status === 401) {
        return handle401Error(authReq, next);
      }

      return throwError(error);
    })
  );

  function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
    const isRefreshing = new BehaviorSubject<boolean>(false);
    const refreshTokenSubject = new BehaviorSubject<any>(null);

    if (!isRefreshing.value) {
      isRefreshing.next(true);
      refreshTokenSubject.next(null);

      const token = authService.getRefreshToken();

      if (token) {
        return authService.newRefreshToken(token).pipe(
          switchMap((token: any) => {
            isRefreshing.next(false);
            authService.saveToken(token.accessToken);
            refreshTokenSubject.next(token.accessToken);
            return next(addTokenHeader(request, token.accessToken));
          }),
          catchError((err) => {
            isRefreshing.next(false);
            authService.signOut();
            router.navigate(['/login']);
            return throwError(err);
          })
        );
      }
    }

    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => next(addTokenHeader(request, token)))
    );
  }

  function addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({ headers: request.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token) });
  }
};
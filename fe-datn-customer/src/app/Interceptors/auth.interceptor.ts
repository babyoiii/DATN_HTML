import { HttpEvent, HttpInterceptorFn, HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthServiceService } from '../Service/auth-service.service';
import { Router } from '@angular/router';

const TOKEN_HEADER_KEY = 'Authorization';

// Giữ trạng thái refresh token chung
const isRefreshing = new BehaviorSubject<boolean>(false);
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptorFn: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthServiceService);
  const router = inject(Router);
  if (req.url.includes('esgoo.net')) {
    return next(req);
  }
  if (req.url.includes('maps.googleapis.com')) {
    return next(req);
  }

  let authReq = req;
  const token = authService.getToken();
  if (token != null) {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Bypass CORS errors

      // Nếu lỗi là 401, xử lý refresh token
      if (error instanceof HttpErrorResponse && error.status === 401 && !authReq.url.includes('/auth/signin')) {
        return handle401Error(authReq, next, authService, router);
      }

      return throwError(() => error);
    })
  );
};

// 🛠 Xử lý lỗi 401 (Unauthorized)
function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthServiceService, router: Router): Observable<HttpEvent<any>> {
  if (!isRefreshing.value) {
    isRefreshing.next(true);
    refreshTokenSubject.next(null);

    const token = authService.getRefreshToken();
    console.log("Refresh Token:", token);  // Kiểm tra token có bị null không

    if (!token) {
      console.error("Lỗi: Refresh token bị null!");
      authService.signOut();
      router.navigate(['/login']);
      return throwError(() => new Error('Refresh token bị thiếu'));
    }

    return authService.newRefreshToken(token).pipe(
      switchMap((response: any) => {
        console.log("Token mới:", response.accessToken);
        isRefreshing.next(false);
        authService.saveToken(response.accessToken);
        refreshTokenSubject.next(response.accessToken);
        return next(addTokenHeader(request, response.accessToken));
      }),
      catchError((err) => {
        console.error("Lỗi khi refresh token:", err);
        isRefreshing.next(false);
        authService.signOut();
        router.navigate(['/login']);
        return throwError(() => new Error('Refresh token không hợp lệ'));
      })
    );
  }

  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap((token) => next(addTokenHeader(request, token!)))
  );
}

function addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}
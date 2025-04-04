import { HttpEvent, HttpInterceptorFn, HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthServiceService } from '../Service/auth-service.service';
import { Router } from '@angular/router';

export const authInterceptorFn: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthServiceService);
  const router = inject(Router);
  if (req.url.includes('esgoo.net') || req.url.includes('maps.googleapis.com')) {
    return next(req);
  }

  let authReq = req;
  const token = authService.getToken();
  if (token && token.trim() !== '') {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        console.error('Unauthorized request - Redirecting to login.');
        authService.signOut();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

function addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

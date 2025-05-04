import { HttpEvent, HttpInterceptorFn, HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthServiceService } from '../Service/auth-service.service';
import { Router } from '@angular/router';

export const authInterceptorFn: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthServiceService);
  const router = inject(Router);

  // Danh sách các URL cần bỏ qua
  const excludedUrls = [
    'esgoo.net',
    'maps.googleapis.com',
    'https://api.exchangerate-api.com',
    'https://api.coingecko.com'
  ];

  // Kiểm tra nếu URL nằm trong danh sách bỏ qua
  if (excludedUrls.some(url => req.url.includes(url))) {
    return next(req);
  }

  let authReq = req;
  const token = authService.getToken();

  // Nếu có token, kiểm tra hạn sử dụng và thêm vào header
  if (token && token.trim() !== '') {
    if (isTokenExpired(token)) {
      console.warn('❌ Token đã hết hạn. Đăng xuất...');
      authService.signOut();
      return next(req); // Tiếp tục gửi yêu cầu mà không thêm token
    }
    authReq = addTokenHeader(req, token);
  }

  // Nếu không có token, tiếp tục gửi yêu cầu mà không thêm header
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Xử lý lỗi
      if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          case 401: // Unauthorized
            if (token) {
              authService.signOut();
              router.navigate(['/']);
            }
            break;
          case 403: 
            console.error('❌ Forbidden request - Access denied.');
            break;
          default:
            console.error(`❌ HTTP Error: ${error.status} - ${error.message}`);
        }
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

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])); 
    const currentTime = Math.floor(Date.now() / 1000); 
    return payload.exp < currentTime; 
  } catch (error) {
    console.error('Lỗi khi kiểm tra token:', error);
    return true; 
  }
}
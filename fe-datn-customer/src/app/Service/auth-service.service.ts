import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChangePasswordModel, SignIn, SignUp, UserInfo } from '../Models/AuthModel';
import { Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  private token: string = ''; // Token mặc định là chuỗi rỗng
  private baseUrl = environment.baseUrl;

  // Khởi tạo BehaviorSubject dựa trên token có tồn tại hay không
  private loggedIn: BehaviorSubject<boolean>;
  public isLoggedIn$;

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cookieService: CookieService
  ) {
    const tokenExists = this.hasToken();
    this.loggedIn = new BehaviorSubject<boolean>(tokenExists);
    this.isLoggedIn$ = this.loggedIn.asObservable();
  }

  // Đăng ký người dùng
  SignUp(signUpData: SignUp): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Auth/SignUp`, signUpData);
  }

  // Đăng nhập
  SignIn(signInData: SignIn): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Auth/Login`, signInData);
  }
  getUserInformation(userId: string): Observable<any> {
    return this.http.get<UserInfo>(`${this.baseUrl}/Auth/GetUserInfo?userId=${userId}`);
  }
  // Đăng xuất: Xóa token và chuyển hướng về trang chủ
  SignOut(): void {
    this.signOut();
    this.router.navigate(['/']);
  }

  /**
   * Lưu token vào localStorage và cookie.
   * @param token - Access token nhận từ backend.
   */
  saveToken(token: string): void {
    this.token = token;
    console.log('Token received:', token); // Kiểm tra token có giá trị không
  
    const exp = this.getTokenExpiration(token);
    if (!exp) {
      console.warn('Token expiration not found');
      return;
    }
  
    const expireDays = (exp - Date.now()) / (1000 * 86400);
    console.log('Token expires in days:', expireDays);
  
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('accessToken', token);
      this.cookieService.set('accessToken', token, expireDays, '/', '', true, 'Strict'); 
      console.log('Token saved in localStorage and cookie');
    }
  
    this.loggedIn.next(true);
  }

  getToken(): string {
    if (isPlatformBrowser(this.platformId)) {
      try {
        let token = this.cookieService.get('accessToken');
        if (!token) {
          token = localStorage.getItem('accessToken') ?? '';
        }
        return token;
      } catch (error) {
        console.error('Error getting token:', error);
        return '';
      }
    }
    return '';
  }

  signOut(): void {
    this.token = '';
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      this.cookieService.delete('accessToken', '/');
    }
    this.loggedIn.next(false);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }

  private hasToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const tokenLocal = localStorage.getItem('accessToken');
      const tokenCookie = this.cookieService.get('accessToken');
      console.log('Token from localStorage:', tokenLocal);
      console.log('Token from cookie:', tokenCookie);
      return !!tokenLocal || !!tokenCookie;
    }
    return false;
  }

  /**
   * Giải mã token để lấy thời gian hết hạn.
   * @param token - Access token nhận từ backend.
   */
  private getTokenExpiration(token: string): number | null {
    if (!token) return null;

    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1])); // Giải mã phần payload của JWT
      return tokenPayload.exp ? tokenPayload.exp * 1000 : null; // Chuyển giây thành milliseconds
    } catch (error) {
      console.error('Lỗi khi giải mã token:', error);
      return null;
    }
  }
  saveUserData(response: any): void {
    if (response?.data) {
      const { userId, userName, displayName,email } = response.data;
  
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
      localStorage.setItem('displayName', displayName);
      localStorage.setItem('email', email);
  
      this.cookieService.set('userId', userId);
      this.cookieService.set('userName', userName);
      this.cookieService.set('displayName', displayName);
      this.cookieService.set('email', email);

      console.log('User data saved:', { userId, userName, displayName,email });
    }
  }
  getUserData(): { userId: string; userName: string; displayName: string } | null {
    const userId = localStorage.getItem('userId') ?? '';
    const userName = localStorage.getItem('userName') ?? '';
    const displayName = localStorage.getItem('displayName') ?? '';
    return userId ? { userId, userName, displayName } : null;
  }
  ChangePassword(changePasswordModel : ChangePasswordModel): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Auth/ChangePassword`, changePasswordModel);
  }
}

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SignIn, SignUp } from '../Models/AuthModel';
import { Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private baseUrl = environment.baseUrl;

  // BehaviorSubject lưu trạng thái đăng nhập, khởi tạo dựa trên việc có token hay không
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  // Expose Observable để các component subscribe
  public isLoggedIn$ = this.loggedIn.asObservable();

  constructor(
    private router: Router, 
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  SignUp(signUpData: SignUp): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Auth/SignUp`, signUpData);
  }

  SignIn(signInData: SignIn): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Auth/Login`, signInData);
  }

  SignOut() {
    this.signOut();
    this.router.navigate(['/']);
  }

  saveToken(token: string) {
    this.token = token;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('accessToken', token);
    }
    // Cập nhật trạng thái đăng nhập sang true
    this.loggedIn.next(true);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      try {
        return localStorage.getItem('accessToken');
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  saveRefreshToken(refreshToken: string) {
    this.refreshToken = refreshToken;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  getRefreshToken(): string | null {
    if (!this.refreshToken && isPlatformBrowser(this.platformId)) {
      this.refreshToken = localStorage.getItem('refreshToken');
    }
    return this.refreshToken;
  }

  signOut() {
    this.token = null;
    this.refreshToken = null;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    this.loggedIn.next(false);
  }

  newRefreshToken(token: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Auth/RefreshToken`, { refreshToken: token });
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private hasToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('accessToken');
    }
    return false;
  }
}

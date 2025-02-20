import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SignIn, SignUp } from '../Models/AuthModel';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private baseUrl = environment.baseUrl;

  constructor(private router: Router, private http: HttpClient) {}

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
    localStorage.setItem('accessToken', token);
  }

  getToken(): string | null {
    try {
      return localStorage.getItem('accessToken');
    } catch (error) {
      return null;
    }
  }
  saveRefreshToken(refreshToken: string) {
    this.refreshToken = refreshToken;
    localStorage.setItem('refreshToken', refreshToken);
  }

  getRefreshToken(): string | null {
    if (!this.refreshToken) {
      this.refreshToken = localStorage.getItem('refreshToken');
    }
    return this.refreshToken;
  }

  signOut() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  newRefreshToken(token: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Auth/RefreshToken`, { refreshToken: token });
  }
}
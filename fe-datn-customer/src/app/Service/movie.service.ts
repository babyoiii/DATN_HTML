import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
 private baseUrl = environment.baseUrl; 
 constructor(private router: Router, private http: HttpClient) {}
 getMovies(type: number, currentPage: number, recordPerPage: number) {
   return this.http.get<any>(`${this.baseUrl}/Movie/GetMovie?type=${type}&currentPage=${currentPage}&recordPerPage=${recordPerPage}`);
 }
}
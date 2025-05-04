import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { GetAllNameMovie } from '../Models/MovieModel';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private baseUrl = environment.baseUrl;
  constructor(private router: Router, private http: HttpClient) { }
  getMovies(type: number, currentPage: number, recordPerPage: number, movieType?: string) {
    const params: any = {
      type: type,
      currentPage: currentPage,
      recordPerPage: recordPerPage
    };

    if (movieType) {
      params.movieType = movieType;
    }

    return this.http.get<any>(`${this.baseUrl}/Movie/GetMovie`, { params });
  }
  getShowtimes(cinemaId : string,movieId: string, location: string, date: Date, currentPage: number, recordPerPage: number) {
    return this.http.get<any>(`${this.baseUrl}/Movie/GetShowTimeLanding`, {
      params: {
        cinemaId: cinemaId,
        movieId: movieId,
        location: location,
        date: date.toISOString(),
        currentPage: currentPage.toString(),
        recordPerPage: recordPerPage.toString()
      }
    });
  }
  getAllNameMovies(): Observable<GetAllNameMovie[]> {
    return this.http.get<GetAllNameMovie[]>(`${this.baseUrl}/Movie/GetAllNameMovie`);
  }


  getMovieDetail(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Movie/GetDetailMovie?movieId=${id}`);
  }
  getCinemasByLocation(location: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Movie/GetCinemaByLocation`, {
      params: {
        location: location
      }
    });
  }
  getAllCinemas(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Movie/GetCinemaAll`);
  }
  getMovieTypes(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Movie/GetMovieType`);
  }
}
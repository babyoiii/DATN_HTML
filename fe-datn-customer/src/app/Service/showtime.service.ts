import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MovieByShowtimeData } from '../Models/MovieModel';

export interface ShowtimeResponse {
  id: string;
  movieId: string;
  movieName: string;
  thumbnail: string;
  duration: number;
  showtime: string;
  theater: string;
  room: string;
  seats: Array<{
    id: string;
    row: string;
    number: number;
    type: 'standard' | 'vip' | 'couple' | 'wheelchair';
    price: number;
    status: 'available' | 'selected' | 'booked' | 'unavailable';
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ShowtimeService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getShowtimeDetail(showtimeId: string): Observable<ShowtimeResponse> {
    return this.http.get<ShowtimeResponse>(`${this.baseUrl}/Showtime/GetShowtimeDetail/${showtimeId}`);
  }

  bookSeats(showtimeId: string, seatIds: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/Showtime/BookSeats`, {
      showtimeId,
      seatIds
    });
  }
  getMovieByShowtime(showtimeId: string): Observable<any> {
    return this.http.get<MovieByShowtimeData>(`${this.baseUrl}/Movie/GetMovieByShowTime?showtimeId=${showtimeId}`);
  }
} 
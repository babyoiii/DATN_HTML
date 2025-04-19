import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RatingRequest {
  movieId: string;
  ratingValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  /**
   * Create a new rating for a movie
   * @param rating - Rating data containing movieId and ratingValue
   */
  createRating(rating: RatingRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/Comment/CreateRating`, rating);
  }

  /**
   * Update an existing rating
   * @param ratingId - Rating ID
   * @param ratingValue - New rating value
   */
  updateRating(ratingId: string, ratingValue: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Comment/UpdateRating`, {
      ratingId: ratingId,
      ratingValue: ratingValue
    });
  }

  /**
   * Delete a rating
   * @param id - Rating ID
   */
  deleteRating(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Comment/DeleteRating`, id);
  }

  /**
   * Check if the current user is logged in
   * @returns boolean indicating login status
   */
  isLoggedIn(): boolean {
    return localStorage.getItem('accessToken') !== null;
  }

  /**
   * Get the current user's ID
   * @returns User ID or null if not logged in
   */
  getCurrentUserId(): string | null {
    return localStorage.getItem('userId');
  }
}

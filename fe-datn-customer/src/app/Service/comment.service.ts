import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Comment {
  id: string;
  username: string;
  content: string;
  createDate: string;
  status: number;
  movieId: string;
  userId: string;
}

export interface CommentResponse {
  responseCode: number;
  message: string;
  data: Comment[];
  totalRecord: number;
}

export interface CreateCommentRequest {
  content: string;
  movieID: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get comments for a movie with pagination
   * @param movieId - ID of the movie
   * @param currentPage - Current page number (starts from 1)
   * @param recordPerPage - Number of records per page
   */
  getComments(movieId: string, currentPage: number = 1, recordPerPage: number = 10): Observable<CommentResponse> {
    let params = new HttpParams()
      .set('movieId', movieId)
      .set('currentPage', currentPage.toString())
      .set('recordPerPage', recordPerPage.toString());

    return this.http.get<CommentResponse>(`${this.apiUrl}/Comment/GetCommentList`, { params });
  }

  /**
   * Add a new comment to a movie
   * @param comment - Comment data containing content and movieID
   */
  addComment(comment: CreateCommentRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/Comment/AddComment`, comment);
  }

  /**
   * Update an existing comment
   * @param id - Comment ID
   * @param content - New comment content
   */
  updateComment(id: string, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/UpdateComment`, {
      id: id,
      content: content
    });
  }

  /**
   * Delete a comment
   * @param id - Comment ID
   */
  deleteComment(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/DeleteComment`, { id });
  }

  /**
   * Check if the current user is logged in
   * @returns boolean indicating login status
   */
  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  }

  /**
   * Get the current user's ID
   * @returns User ID or null if not logged in
   */
  getCurrentUserId(): string | null {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        return parsedData.id || null;
      } catch (e) {
        console.error('Error parsing user data', e);
        return null;
      }
    }
    return null;
  }
}
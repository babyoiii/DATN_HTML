import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieService } from '../../Service/movie.service';
// import { DurationFormatPipe } from '../../duration-format.pipe';
import { RelativeTimePipe } from '../../datetime.pipe'; // Add this import
import { CommentService, Comment } from '../../Service/comment.service';
import { catchError, finalize, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { GetMovieLandingRes } from '../../Models/MovieModel';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-movie-detail-nghia',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HttpClientModule,RelativeTimePipe],
  templateUrl: './movie-detail-nghia.component.html',
  styleUrls: ['./movie-detail-nghia.component.css']
})
export class MovieDetailNghiaComponent implements OnInit {
  movie: any;
  relatedMovies: GetMovieLandingRes[] = [];
  isTrailerOpen = false;
  safeTrailerUrl: SafeResourceUrl | null = null;
  isYoutubeTrailer = false;
  isLoading = true;
  error: string | null = null;


  // Comment related properties
  comments: Comment[] = [];
  currentCommentPage: number = 1;
  totalCommentRecords: number = 0;
  recordsPerPage: number = 10;
  isLoadingComments: boolean = false;
  commentError: string | null = null;
  newComment: string = '';
  isSubmittingComment: boolean = false;
  movieId: string = '';
  isLoggedIn: boolean = false;





  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private commentService: CommentService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.commentService.isLoggedIn();
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.movieId = id;
        this.loadMovieDetails(id);
        this.loadComments();
      }
    });
  }



  loadMovieDetails(id: string): void {
    this.isLoading = true;
    this.movieService.getMovieDetail(id)
      .pipe(
        catchError(error => {
          this.error = 'Error loading movie details. Please try again.';
          console.error('Error fetching movie details:', error);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(response => {
        if (response && response.data) {
          this.movie = response.data;
          // Once we have the movie details, get related movies
          this.loadRelatedMovies();
        }
      });
  }

  loadRelatedMovies(): void {
    // Get movies with the same status (Now Playing, Coming Soon, etc.)
    const status = this.movie.status;
    this.movieService.getMovies(status, 1, 6)
      .pipe(
        catchError(error => {
          console.error('Error fetching related movies:', error);
          return of(null);
        }),
        map(response => {
          if (response && response.data) {
            // Thêm status cho mỗi phim nếu API không trả về
            return response.data.map((movie: GetMovieLandingRes) => ({
              ...movie,
              status: status // Gán cùng status với phim hiện tại
            }));
          }
          return [];
        })
      )
      .subscribe(relatedMovies => {
        if (relatedMovies) {
          // Filter out the current movie and take up to 5 related movies
          this.relatedMovies = relatedMovies
            .filter((m: GetMovieLandingRes) => m.id !== this.movie.id)
            .slice(0, 5);
        }
      });
  }


  getStatusText(status: number): string {
    switch (status) {
      case 0:
        return 'Đang chiếu';
      case 1:
        return 'Sắp chiếu';
      case 2:
        return 'Ngừng chiếu';
      default:
        return 'Không xác định';
    }
  }

  openTrailer(): void {
    // Check if trailer URL is a YouTube link
    this.isTrailerOpen = true;
    this.processTrailerUrl();
  }

  closeTrailer(): void {
    this.isTrailerOpen = false;
  }



  
  private processTrailerUrl(): void {
    if (!this.movie.trailer) return;

    // Check if it's a YouTube link
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = this.movie.trailer.match(youtubeRegex);

    if (match && match[1]) {
      // Extract YouTube video ID
      const videoId = match[1];
      this.isYoutubeTrailer = true;
      // Create safe URL for YouTube embed
      this.safeTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
      );
    } else {
      // Handle non-YouTube video URLs
      this.isYoutubeTrailer = false;
      this.safeTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.movie.trailer);
    }
  }





  loadComments(): void {
    this.isLoadingComments = true;
    this.commentError = null;
    
    this.commentService.getComments(this.movieId, this.currentCommentPage, this.recordsPerPage)
      .pipe(
        catchError(error => {
          this.commentError = 'Error loading comments. Please try again.';
          console.error('Error fetching comments:', error);
          return of(null);
        }),
        finalize(() => {
          this.isLoadingComments = false;
        })
      )
      .subscribe(response => {
        if (response && response.data) {
          this.comments = response.data;
          this.totalCommentRecords = response.totalRecord;
        }
      });
  }

  submitComment(event: Event): void {
    event.preventDefault();
    
    if (!this.newComment.trim()) {
      return;
    }
    
    this.isSubmittingComment = true;
    
    const commentData = {
      content: this.newComment.trim(),
      movieID: this.movieId
    };
    
    this.commentService.addComment(commentData)
      .pipe(
        catchError(error => {
          console.error('Error adding comment:', error);
          return of({ responseCode: -1, message: 'Failed to add comment' });
        }),
        finalize(() => {
          this.isSubmittingComment = false;
        })
      )
      .subscribe(response => {
        if (response && response.responseCode === 200) {
          this.newComment = '';
          // Reload comments to show the new one
          this.loadComments();
        } else {
          alert(response.message || 'Failed to add comment. Please try again.');
        }
      });
  }

  nextCommentPage(): void {
    const totalPages = Math.ceil(this.totalCommentRecords / this.recordsPerPage);
    if (this.currentCommentPage < totalPages) {
      this.currentCommentPage++;
      this.loadComments();
    }
  }

  prevCommentPage(): void {
    if (this.currentCommentPage > 1) {
      this.currentCommentPage--;
      this.loadComments();
    }
  }

  get commentPages(): number[] {
    const totalPages = Math.ceil(this.totalCommentRecords / this.recordsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changeCommentPage(page: number): void {
    this.currentCommentPage = page;
    this.loadComments();
  }

  isCommentOwner(userId: string): boolean {
    const currentUserId = this.commentService.getCurrentUserId();
    return currentUserId === userId;
  }

  deleteComment(commentId: string): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentService.deleteComment(commentId)
        .subscribe({
          next: () => {
            this.comments = this.comments.filter(c => c.id !== commentId);
            this.loadComments();
          },
          error: (error) => {
            console.error('Error deleting comment:', error);
            alert('Failed to delete comment. Please try again.');
          }
        });
    }
  }
}
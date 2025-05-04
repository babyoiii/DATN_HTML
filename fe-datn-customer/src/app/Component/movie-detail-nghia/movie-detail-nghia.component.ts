import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieService } from '../../Service/movie.service';
// import { DurationFormatPipe } from '../../duration-format.pipe';
import { RelativeTimePipe } from '../../datetime.pipe'; // Add this import
import { CommentService, Comment } from '../../Service/comment.service';
import { RatingService } from '../../Service/rating.service';
import { AuthServiceService } from '../../Service/auth-service.service';
import { catchError, finalize, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { GetMovieLandingRes } from '../../Models/MovieModel';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-movie-detail-nghia',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HttpClientModule, RelativeTimePipe],
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

  // Rating related properties
  userRating: number = 0;
  isSubmittingRating: boolean = false;
  ratingError: string | null = null;
  hoveredRating: number = 0;
  userRatingId: string | null = null;





  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private commentService: CommentService,
    private ratingService: RatingService,
    private authService: AuthServiceService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();

    // Đăng ký theo dõi trạng thái đăng nhập
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      console.log('Login status updated from AuthService:', status);
    });

    // Debug thông tin đăng nhập
    console.log('accessToken exists:', localStorage.getItem('accessToken') !== null);
    console.log('userId exists:', localStorage.getItem('userId') !== null);
    console.log('isLoggedIn value:', this.isLoggedIn);

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.movieId = id;
        this.loadMovieDetails(id);
        this.loadComments();
        this.checkUserRating();
      }
    });
  }

  // Kiểm tra xem người dùng đã đánh giá phim này chưa
  checkUserRating(): void {
    if (!this.isLoggedIn) return;

    // Lấy userId trực tiếp từ localStorage
    const currentUserId = localStorage.getItem('userId');
    console.log('Kiểm tra rating cho userId:', currentUserId);

    if (!currentUserId) {
      console.log('Không tìm thấy userId trong localStorage');
      return;
    }

    // Tìm rating của user trong danh sách comments
    // Đây là cách tạm thời, lý tưởng nhất là có API riêng để lấy rating của user
    this.commentService.getComments(this.movieId)
      .subscribe(response => {
        if (response && response.data) {
          console.log('Tổng số comments:', response.data.length);

          const userComment = response.data.find(comment => comment.userId === currentUserId);
          console.log('Tìm thấy comment của user:', userComment ? 'Có' : 'Không');

          if (userComment && userComment.ratingvalue) {
            console.log('Rating của user:', userComment.ratingvalue);
            this.userRating = userComment.ratingvalue;
            // Giả định rằng ID của rating giống với ID của comment
            // Trong thực tế, bạn cần API riêng để lấy ID của rating
            this.userRatingId = userComment.id;
          }
        }
      });
  }



  loadMovieDetails(id: string): void {
    this.isLoading = true;
    this.movieService.getMovieDetail(id)
      .pipe(
        catchError(error => {
          this.error = 'Error loading movie details. Please try again.';
          // console.error('Error fetching movie details:', error);
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
          // console.error('Error fetching related movies:', error);
          return of(null);
        }),
        map(response => {
          if (response && response.data) {
            // Thêm status và ageRatingCode cho mỗi phim nếu API không trả về
            return response.data.map((movie: GetMovieLandingRes) => {
              // Lấy thông tin chi tiết của từng phim để có ageRatingCode
              this.movieService.getMovieDetail(movie.id).subscribe(detailResponse => {
                if (detailResponse && detailResponse.data) {
                  movie.ageRatingCode = detailResponse.data.ageRatingCode;
                  movie.ageRatingId = detailResponse.data.ageRatingId;
                }
              });

              return {
                ...movie,
                status: status // Gán cùng status với phim hiện tại
              };
            });
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

  getStatusBasedOnAge(status: number): string {
    // Trả về mã độ tuổi dựa trên status nếu không có ageRatingCode
    switch (status) {
      case 0:
        return 'P';
      case 1:
        return 'C16';
      case 2:
        return 'FULL18';
      default:
        return 'P';
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

    // Đầu tiên lấy tất cả bình luận để đếm tổng số
    this.commentService.getComments(this.movieId, 1, 1000)
      .pipe(
        catchError(error => {
          this.commentError = 'Error loading comments. Please try again.';
          // console.error('Error fetching all comments:', error);
          return of(null);
        })
      )
      .subscribe(allCommentsResponse => {
        if (allCommentsResponse && allCommentsResponse.data) {
          // Cập nhật tổng số bình luận
          this.totalCommentRecords = allCommentsResponse.data.length;
          console.log('Tổng số bình luận:', this.totalCommentRecords);

          // Sau đó lấy bình luận theo trang
          this.commentService.getComments(this.movieId, this.currentCommentPage, this.recordsPerPage)
            .pipe(
              catchError(error => {
                this.commentError = 'Error loading comments. Please try again.';
                // console.error('Error fetching paged comments:', error);
                return of(null);
              }),
              finalize(() => {
                this.isLoadingComments = false;
              })
            )
            .subscribe(response => {
              if (response && response.data) {
                this.comments = response.data;
              }
            });
        } else {
          this.isLoadingComments = false;
        }
      });
  }

  submitComment(event: Event): void {
    event.preventDefault();

    if (!this.newComment.trim()) {
      return;
    }

    this.isSubmittingComment = true;
    this.ratingError = null;

    // Kiểm tra xem người dùng đã chọn rating chưa
    if (this.userRating === 0) {
      this.ratingError = 'Vui lòng chọn số sao đánh giá trước khi gửi bình luận';
      this.isSubmittingComment = false;
      return;
    }

    // Sử dụng giá trị userRating đã được chọn
    const ratingValue = this.userRating;

    // Tạo rating trước
    const ratingData = {
      movieId: this.movieId,
      ratingValue: ratingValue
    };

    this.ratingService.createRating(ratingData)
      .pipe(
        catchError(error => {
          console.error('Error creating rating:', error);
          return of({ responseCode: -1, message: error.error?.message || 'Lỗi khi đánh giá phim' });
        })
      )
      .subscribe(ratingResponse => {
        // Nếu rating thành công hoặc đã tồn tại (mã -2004), tiếp tục tạo comment
        if (ratingResponse.responseCode === 200 || ratingResponse.responseCode === -2004) {
          // Nếu rating đã tồn tại, hiển thị thông báo nhưng vẫn tiếp tục tạo comment
          if (ratingResponse.responseCode === -2004) {
            console.log('Người dùng đã đánh giá phim này trước đó');
          }

          // Tạo comment
          const commentData = {
            content: this.newComment.trim(),
            movieID: this.movieId
          };

          this.commentService.addComment(commentData)
            .pipe(
              catchError(error => {
                console.error('Error adding comment:', error);
                return of({ responseCode: -1, message: error.error?.message || 'Lỗi khi thêm bình luận' });
              }),
              finalize(() => {
                this.isSubmittingComment = false;
              })
            )
            .subscribe(commentResponse => {
              if (commentResponse.responseCode === 200) {
                this.newComment = '';
                // Cập nhật userRating nếu rating thành công
                if (ratingResponse.responseCode === 200) {
                  this.userRating = ratingValue;
                }
                // Reload comments để hiển thị comment mới
                this.loadComments();
              } else if (commentResponse.responseCode === -2004) {
                // Người dùng đã bình luận trước đó
                this.ratingError = 'Bạn đã bình luận cho phim này rồi. Mỗi người chỉ được bình luận một lần.';
              } else {
                this.ratingError = commentResponse.message || 'Lỗi khi thêm bình luận. Vui lòng thử lại.';
              }
            });
        } else {
          // Xử lý lỗi rating
          this.isSubmittingComment = false;
          if (ratingResponse.responseCode === -1997) {
            this.ratingError = 'Bạn cần phải xem phim trước khi đánh giá';
          } else if (ratingResponse.responseCode === -1996) {
            this.ratingError = 'Giá trị đánh giá không hợp lệ (phải từ 1-10)';
          } else {
            this.ratingError = ratingResponse.message || 'Lỗi khi đánh giá phim. Vui lòng thử lại.';
          }
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
    const currentUserId = localStorage.getItem('userId');
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

  // Rating methods - Đã được tích hợp vào submitComment

  // Phương thức để hiển thị số sao khi hover và lưu giá trị khi click
  setHoveredRating(rating: number): void {
    this.hoveredRating = rating;
    // Khi người dùng click vào sao, lưu giá trị vào userRating
    this.userRating = rating;
  }

  // Phương thức để xóa số sao khi không hover nữa
  clearHoveredRating(): void {
    // Chỉ xóa giá trị hover, giữ nguyên giá trị đã chọn (userRating)
    this.hoveredRating = 0;
  }

  // Phương thức để lấy class cho sao dựa trên trạng thái
  getStarClass(position: number): string {
    if (this.hoveredRating >= position) {
      return 'text-yellow-400'; // Sao đang hover
    } else if (this.userRating >= position) {
      return 'text-yellow-400'; // Sao đã chọn
    }
    return 'text-gray-400'; // Sao chưa chọn
  }

  // Phương thức debug cho template
  checkAccessToken(): boolean {
    return localStorage.getItem('accessToken') !== null;
  }

  checkUserId(): boolean {
    return localStorage.getItem('userId') !== null;
  }

  refreshLoginStatus(): void {
    // Cập nhật trạng thái đăng nhập từ AuthService
    this.isLoggedIn = this.authService.isLoggedIn();

    console.log('Trạng thái đăng nhập đã được cập nhật:', this.isLoggedIn);
    console.log('accessToken:', localStorage.getItem('accessToken'));
    console.log('userId:', localStorage.getItem('userId'));

    // Nếu đã đăng nhập, kiểm tra rating của người dùng
    if (this.isLoggedIn) {
      this.checkUserRating();
    }
  }

  // Phương thức giả lập đăng nhập cho mục đích debug
  simulateLogin(): void {
    // Tạo một token giả và userId giả
    localStorage.setItem('accessToken', 'fake-token-for-testing');
    localStorage.setItem('userId', '12345678-1234-1234-1234-123456789012');

    // Cập nhật trạng thái đăng nhập
    this.refreshLoginStatus();

    // Thông báo cho người dùng
    alert('Đã giả lập đăng nhập thành công. Bây giờ bạn có thể thử bình luận và đánh giá.');
  }
}
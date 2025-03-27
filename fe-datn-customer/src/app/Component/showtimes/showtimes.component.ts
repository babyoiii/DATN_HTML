import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MovieService } from '../../Service/movie.service';
import { GetAllNameMovie, GetShowTimeLandingRes } from '../../Models/MovieModel';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { DurationFormatPipe } from '../../duration-format.pipe';
import { log } from 'node:console';
import { SafePipe } from "../../safe.pipe";

@Component({
  selector: 'app-showtimes',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule, DurationFormatPipe, SafePipe],
  templateUrl: './showtimes.component.html',
  styleUrls: ['./showtimes.component.css']
})
export class ShowtimesComponent implements OnInit {
  listData: GetShowTimeLandingRes[] = [];
  groupedData: { [key: string]: { thumbnail: string; trailer: string; duration: number; theaters: { [key: string]: { address: string; showtimes: any[] } } } } = {};
  listMoive: GetAllNameMovie[] = [];
  movieId: string = '';
  location: string = 'Hà Nội';
  date: string = new Date().toISOString().split('T')[0];
  currentPage = 1;
  recordPerPage = 100;
  selectedMovie: {
    name: string;
    thumbnail: string;
    trailer: string;
    duration: number;
  } | null = null;

  constructor(private movieService: MovieService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.movieId = id;
        // Tìm trailer từ ID phim ngay từ đầu
        this.movieService.getMovieDetail(id).subscribe(movieDetail => {
          if (movieDetail && movieDetail.data && movieDetail.data.trailer) {
            this.Trailer = movieDetail.data.trailer;
          }
        });
      }
      this.getmovieName();
      this.getShowTimes();
    });
  }

  getmovieName() {
    this.movieService.getAllNameMovies().subscribe({
      next: (res: any) => {
        this.listMoive = res.data;
        // Nếu có movieId từ param, tìm phim tương ứng trong listMoive
        if (this.movieId) {
          const selectedMovie = this.listMoive.find(movie => movie.id === this.movieId);
          if (selectedMovie) {
            this.selectedMovie = {
              name: selectedMovie.movieName,
              thumbnail: selectedMovie.thumbnail || '',
              trailer: selectedMovie.trailer || '',
              duration: selectedMovie.duration || 0
            };
          }
        }
      },
      error: (err) => {
        console.error('Error fetching movies:', err);
      }
    });
  }

  getShowTimes() {
    this.movieService.getShowtimes(this.movieId, this.location, new Date(this.date), this.currentPage, this.recordPerPage).subscribe({
      next: (data: any) => {
        this.listData = data.data;
        this.groupShowtimesByMovieAndTheater();
        console.log('Data:', this.listData);
        console.log('Showtimes:', this.groupedData);
      },
      error: (err) => {
        console.error('Error fetching showtimes:', err);
      }
    });
  }

  groupShowtimesByMovieAndTheater() {
    this.groupedData = this.listData.reduce((acc: {
      [key: string]: {
        thumbnail: string;
        trailer: string;
        duration: number;
        theaters: { [key: string]: { address: string; showtimes: any[] } }
      }
    }, item: any) => {

      console.log('Trailer của phim:', item.movieName, item.trailer);

      if (!acc[item.movieName]) {
        acc[item.movieName] = {
          thumbnail: item.thumbnail,
          trailer: item.trailer ?? '',
          duration: item.duration,
          theaters: {}
        };
      }

      if (!acc[item.movieName].theaters[item.name]) {
        acc[item.movieName].theaters[item.name] = {
          address: item.address,
          showtimes: []
        };
      }

      acc[item.movieName].theaters[item.name].showtimes.push(...item.showtimes);
      return acc;
    }, {});

    console.log('Dữ liệu sau khi nhóm:', this.groupedData);
  }


  onMovieChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.movieId = selectElement.value; // Nếu chọn All Movies, giá trị sẽ là rỗng
    this.getShowTimes(); // Gọi API để lấy danh sách phim
  }

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    if (event.value) {
      this.date = event.value.toISOString().split('T')[0];
      this.getShowTimes();
    }
  }

  dateFilter = (d: Date | null): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d ? d >= today : false;
  };
  Trailer: string = '';
  getTrailer(trailer: string) {
    console.log('Trailer: abc', trailer);
    return this.Trailer = trailer;
  }

  selectMovie(movieName: string, movieData: any) {
    const duration = movieData.duration;

    this.selectedMovie = {
      name: movieName,
      thumbnail: movieData.thumbnail || 'assets/images/default-movie-poster.jpg',
      trailer: movieData.trailer || '',
      duration: duration
    };
    this.Trailer = movieData.trailer || '';

    console.log('Đã chọn phim:', this.selectedMovie);
    localStorage.setItem('selectedMovieData', JSON.stringify(this.selectedMovie));
  }









  getSelectedMovieName(): string {
    if (!this.movieId) return 'All Movies';
    const selectedMovie = this.listMoive.find(movie => movie.id === this.movieId);
    return selectedMovie ? selectedMovie.movieName : 'All Movies';
  }















  getShowtime(roomId: string) {
    console.log('Room ID:', roomId);

    // Lưu thông tin phim vào localStorage trước khi chuyển trang
    const currentMovie = this.selectedMovie ||
      (this.movieId ? this.listMoive.find(movie => movie.id === this.movieId) : null);

    if (currentMovie) {
      // Tìm thumbnail từ dữ liệu đã nhóm nếu không có trong currentMovie
      let thumbnailUrl = currentMovie.thumbnail;

      // Tìm thông tin phim đầy đủ từ groupedData
      let movieName = 'name' in currentMovie ? currentMovie.name : currentMovie.movieName;
      let movieDuration = currentMovie.duration;

      // Nếu không có duration hoặc duration = 0, tìm trong groupedData
      if ((!movieDuration || movieDuration === 0) && this.groupedData && this.groupedData[movieName]) {
        movieDuration = this.groupedData[movieName].duration;
      }

      // Nếu vẫn không có, đặt giá trị mặc định hợp lý
      if (!movieDuration || movieDuration === 0) {
        movieDuration = 120; // Mặc định 2 tiếng nếu không có thông tin
      }

      // Nếu thumbnail vẫn trống, tìm trong groupedData
      if (!thumbnailUrl && this.groupedData && this.groupedData[movieName]) {
        thumbnailUrl = this.groupedData[movieName].thumbnail;
      }

      // Nếu vẫn trống, dùng đường dẫn ảnh mặc định
      if (!thumbnailUrl) {
        thumbnailUrl = 'assets/images/default-movie-poster.jpg';
      }

      const movieInfo = {
        name: movieName,
        duration: movieDuration,
        thumbnail: thumbnailUrl,
        theater: this.findTheaterNameByRoomId(roomId),
        showtime: this.findShowtimeByRoomId(roomId),
        date: this.date
      };

      console.log('Movie info being saved:', movieInfo); // Thêm log để debug
      localStorage.setItem('currentMovieInfo', JSON.stringify(movieInfo));
    }

    // Điều hướng đến trang booking
    window.location.href = `/booking/${roomId}`;
  }



  // Thêm 2 phương thức mới để tìm thông tin theater và showtime dựa vào roomId
  private findTheaterNameByRoomId(roomId: string): string {
    for (const movieName in this.groupedData) {
      const movie = this.groupedData[movieName];
      for (const theaterName in movie.theaters) {
        const theater = movie.theaters[theaterName];
        for (const showtime of theater.showtimes) {
          if (showtime.id === roomId) {
            return theaterName;
          }
        }
      }
    }
    return '';
  }

  private findShowtimeByRoomId(roomId: string): string {
    for (const movieName in this.groupedData) {
      const movie = this.groupedData[movieName];
      for (const theaterName in movie.theaters) {
        const theater = movie.theaters[theaterName];
        for (const showtime of theater.showtimes) {
          if (showtime.id === roomId) {
            return showtime.startTime;
          }
        }
      }
    }
    return '';
  }



}
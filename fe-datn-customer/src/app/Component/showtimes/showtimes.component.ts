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
import { CinemaService, CinemaRes } from '../../Service/cinema.service';

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



  cinemas: CinemaRes[] = [];
  selectedCinemaId: string = '';


  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private cinemaService: CinemaService,
  ) { }

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
      // Initialize with current date if not set
      if (!this.date) {
        this.date = new Date().toISOString().split('T')[0];
      }
      this.getmovieName();
      this.getShowTimes();
      this.loadCinemas();
    });
  }


  loadCinemas(): void {
    this.cinemaService.getListCinemas().subscribe({
      next: (response) => {
        if (response.responseCode === 200 && response.data) {
          this.cinemas = response.data;
          if (this.cinemas.length > 0) {
            this.selectedCinemaId = this.cinemas[0].cinemasId;
          }
        }
      },
      error: (error) => {
        console.error('Error loading cinemas:', error);
      }
    });
  }
  onCinemaChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedCinemaId = selectElement.value;

    // Update location based on selected cinema
    const selectedCinema = this.cinemas.find(c => c.cinemasId === this.selectedCinemaId);
    if (selectedCinema && selectedCinema.address) {
      this.location = selectedCinema.address;
    }

    this.getShowTimes(); // Call API to get movies for the selected cinema
  }


  getSelectedCinemaName(): string {
    if (!this.selectedCinemaId) return 'Tất cả các rạp';
    const cinema = this.cinemas.find(c => c.cinemasId === this.selectedCinemaId);
    return cinema ? cinema.name : 'Tất cả các rạp';
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
    // Get the selected cinema's address to use as location filter if a cinema is selected
    if (this.selectedCinemaId) {
      const selectedCinema = this.cinemas.find(c => c.cinemasId === this.selectedCinemaId);
      if (selectedCinema && selectedCinema.address) {
        this.location = selectedCinema.address;
      }
    }
  
    // Đảm bảo ngày là một đối tượng Date hợp lệ
    let dateObj: Date;
    try {
      dateObj = new Date(this.date);
      
      // Kiểm tra xem dateObj có hợp lệ không
      if (isNaN(dateObj.getTime())) {
        // Nếu không hợp lệ, sử dụng ngày hiện tại
        console.error("Invalid date, using current date instead");
        dateObj = new Date();
      }
    } catch (error) {
      console.error("Error parsing date, using current date instead", error);
      dateObj = new Date();
    }
  
    console.log('Filtering with criteria:', {
      movieId: this.movieId || 'All movies',
      location: this.location,
      date: dateObj.toISOString(),
      dateString: this.date
    });
  
    this.movieService.getShowtimes(
      this.movieId || '', // If movieId is empty, pass empty string to get all movies
      this.location,
      dateObj,
      this.currentPage,
      this.recordPerPage
    ).subscribe({
      next: (data: any) => {
        this.listData = data.data;
        this.groupShowtimesByMovieAndTheater();
        console.log('Data received:', this.listData);
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
    this.movieId = selectElement.value;

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
    } else {
      this.selectedMovie = null;
    }

    this.getShowTimes();
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
    return selectedMovie ? selectedMovie.movieName : 'Tất cả các phim';
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














































































































  showDatepicker() {
    // Hiển thị date-picker-container khi mở datepicker
    const container = document.querySelector('.date-picker-container') as HTMLElement;
    if (container) {
      container.style.display = 'block';
    }
  }

  hideDatepicker() {
    // Ẩn date-picker-container khi đóng datepicker
    const container = document.querySelector('.date-picker-container') as HTMLElement;
    if (container) {
      container.style.display = 'none';
    }
  }

}
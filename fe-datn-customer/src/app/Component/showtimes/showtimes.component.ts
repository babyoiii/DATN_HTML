import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../../Service/movie.service';
import { GetAllNameMovie, GetShowTimeLandingRes } from '../../Models/MovieModel';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { DurationFormatPipe } from '../../duration-format.pipe';
import { SafePipe } from '../../safe.pipe';
import { log } from 'node:console';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-showtimes',
  standalone: true,
  imports: [FormsModule, CommonModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule, DurationFormatPipe, SafePipe, RouterModule],
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

  constructor(private movieService: MovieService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.movieId = params.get('id') || '';
      this.getShowTimes();
      this.getmovieName();
      this.groupShowtimesByMovieAndTheater();
    });
  }

  getmovieName() {
    this.movieService.getAllNameMovies().subscribe({
      next: (res: any) => {
        this.listMoive = res.data;
        console.log('Movies:', this.listMoive);
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
      
      console.log('Trailer của phim:', item.movieName, item.trailer); // Debug

      if (!acc[item.movieName]) {
        acc[item.movieName] = {
          thumbnail: item.thumbnail, 
          trailer: this.getYouTubeEmbedUrl(item.trailer) ?? '', // Chuyển đổi URL
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

  // Hàm chuyển đổi URL YouTube thành URL embed
  private getYouTubeEmbedUrl(url: string): string {
    if (!url) return '';
    
    // Xử lý URL dạng watch?v=
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    return url; // Trả về URL gốc nếu không phải URL YouTube hoặc không thể chuyển đổi
  }

  onMovieChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.movieId = selectElement.value;
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
  Trailer :string = '';
  getTrailler(trailer :string){
    console.log('Trailer: abc', trailer);
  return this.Trailer = trailer;
  }

}
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GetMovieLandingRes } from '../../Models/MovieModel';
import { MovieService } from '../../Service/movie.service';
import { DurationFormatPipe } from '../../duration-format.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DurationFormatPipe, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  dataMovies: GetMovieLandingRes[] = [];
  selectedType: number = 1;
  pageSize: number = 20;
  pageIndex: number = 1;
  totalItems: number = 0; 

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.getMovies();
    this.loadScript('./JavaScript/Slide.js');
  }

  loadScript(src: string): void {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
  }

  // Hàm gọi API để lấy danh sách phim
  getMovies(): void {
    this.movieService.getMovies(this.selectedType, this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        this.dataMovies = res.data;
        this.totalItems = res.totalRecord;
        console.log('Movies:', this.dataMovies);
      },
      error: (err) => {
        console.error('Error fetching movies:', err);
      }
    });
  }

  onTabClick(type: number): void {
    if (this.selectedType !== type) {
      this.selectedType = type; 
      this.pageIndex = 1; 
      this.getMovies(); 
    }
  }
}
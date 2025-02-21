import { Component, OnInit } from '@angular/core';
import { GetMovieLandingRes } from '../../Models/MovieModel';
import { MovieService } from '../../Service/movie.service';
import { CommonModule } from '@angular/common';
import { DurationFormatPipe } from '../../duration-format.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, DurationFormatPipe,NgxPaginationModule,RouterLink], 
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.css'
})
export class MoviesComponent implements OnInit {
  dataMovies: GetMovieLandingRes[] = [];
  selectedType: number = 1; // Mặc định là "Now Playing"
  pageSize: number = 15;
  pageIndex: number = 1;
  totalItems: number = 0; // Total number of items for pagination

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.getMovies();
  }

  getMovies() {
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

  changeTab(type: number) {
    if (this.selectedType !== type) {
      this.selectedType = type;
      this.pageIndex = 1; // Reset to the first page when changing tabs
      this.getMovies();
    }
  }
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }
  get pages(): number[] {
    const pagesToShow = 5;
    const startPage = Math.max(1, this.pageIndex - Math.floor(pagesToShow / 2));
    const endPage = Math.min(this.totalPages, startPage + pagesToShow - 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.pageIndex = page;
      this.getMovies();
    }
  }

  nextPage() {
    if (this.pageIndex < this.totalPages) {
      this.pageIndex++;
      this.getMovies();
    }
  }

  prevPage() {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.getMovies();
    }
  }
}

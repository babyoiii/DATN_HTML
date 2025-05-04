import { Component, OnInit } from '@angular/core';
import { GetMovieLandingRes, GetMovieType } from '../../Models/MovieModel';
import { MovieService } from '../../Service/movie.service';
import { CommonModule } from '@angular/common';
import { DurationFormatPipe } from '../../duration-format.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, DurationFormatPipe, NgxPaginationModule, RouterLink, FormsModule],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.css'
})
export class MoviesComponent implements OnInit {
  dataMovies: GetMovieLandingRes[] = [];
  selectedType: number = 1; // Default to "Now Playing"
  pageSize: number = 15;
  pageIndex: number = 1;
  totalItems: number = 0; // Total number of items for pagination
  getMovieType: GetMovieType[] = [];
  movieType: string = '';
  selectedMovieType: string = ''; // To store the selected movie type

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.getMovies();
    this.getMovieTypes();
  }

  getMovies() {
    this.movieService.getMovies(this.selectedType, this.pageIndex, this.pageSize, this.movieType).subscribe({
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

  getMovieTypes() {
    this.movieService.getMovieTypes().subscribe({
      next: (res) => {
        this.getMovieType = res.data;
      },
      error: (err) => {
        console.error('Error fetching movie types:', err);
      }
    });
  }

  handleFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedValue = target.value; 
    this.selectedMovieType = selectedValue;
    this.movieType = selectedValue;
    console.log('Selected Format ID:', this.selectedMovieType);
    this.pageIndex = 1; 
    this.getMovies();
  }
}
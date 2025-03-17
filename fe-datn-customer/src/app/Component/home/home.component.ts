import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GetMovieLandingRes } from '../../Models/MovieModel';
import { MovieService } from '../../Service/movie.service';
import { DurationFormatPipe } from '../../duration-format.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink,DurationFormatPipe,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
 dataMovies: GetMovieLandingRes[] = [];
  selectedType: number = 1; // Mặc định là "Now Playing"
  pageSize: number = 20;
  pageIndex: number = 1;
  totalItems: number = 0; // Total number of items for pagination
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

}

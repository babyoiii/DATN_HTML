import { Component, OnInit } from '@angular/core';
import { LocationService } from '../../Service/location.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-movie-theatres',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-theatres.component.html',
  styleUrls: ['./movie-theatres.component.css']
})
export class MovieTheatresComponent implements OnInit {
  provinces: any[] = [];

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.loadProvinces();
  }

  loadProvinces() {
    this.locationService.getProvinces().subscribe({
      next: (res: any) => {
        this.provinces = res.data;
        console.log('Provinces:', this.provinces);
      },
      error: (err) => {
        console.error('Error fetching provinces:', err);
      }
    });
  }
}
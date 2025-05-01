import { Component, OnInit } from '@angular/core';
import { LocationService } from '../../Service/location.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CinemaByLocation } from '../../Models/Order';
import { MovieService } from '../../Service/movie.service';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-movie-theatres',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink,RouterModule],
  templateUrl: './movie-theatres.component.html',
  styleUrls: ['./movie-theatres.component.css']
})
export class MovieTheatresComponent implements OnInit {
  provinces: any[] = [];
  latitude: number | null = null;
  longitude: number | null = null;
  address: string = '';
  listCinema : CinemaByLocation[] = [];
  listCinemaAll : CinemaByLocation[] = [];
  filteredCinemas: CinemaByLocation[] = []; 
  constructor(private locationService: LocationService, private http: HttpClient,private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadProvinces();
    this.getCinemas(this.address)
    this. getAllCinemas()
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
  getCinemas(location: string): void {
    this.movieService.getCinemasByLocation(location).subscribe({
      next: (res: any) => {
        this.listCinema = res.data.map((cinema: CinemaByLocation) => {
          return {
            ...cinema,
            mapLink: this.generateMapLink(cinema.location) 
          };
        });
        console.log('Cinemas with mapLink:', this.listCinema);
      },
      error: (err) => {
        console.error('Error fetching cinemas:', err);
      }
    });
  }
  filteredCinemasByProvince(provinceName: string): CinemaByLocation[] {
    return this.listCinemaAll.filter(cinema =>
      cinema.location.includes(provinceName)
    );
  }
  getAllCinemas(): void {
    this.movieService.getAllCinemas().subscribe({
      next: (res: any) => {
        this.listCinemaAll = res.data; 
        console.log('All Cinemas:', this.listCinemaAll);
      },
      error: (err) => {
        console.error('Error fetching all cinemas:', err);
      }
    });
  }
  
  generateMapLink(location: string): string {
    const encodedLocation = encodeURIComponent(location);
    return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  }
  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          console.log('Latitude:', this.latitude, 'Longitude:', this.longitude);
          this.getAddressFromCoordinates();
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

  private nominatimUrl = 'https://nominatim.openstreetmap.org/reverse';

  getAddressFromCoordinates() {
    if (this.latitude !== null && this.longitude !== null) {
      const url = `${this.nominatimUrl}?lat=${this.latitude}&lon=${this.longitude}&format=json`;
  
      this.http.get(url).subscribe({
        next: (response: any) => {
          if (response && response.address) {
            if (response.address.city) {
              this.address = response.address.city; // Lấy tên thành phố
            } else if (response.address.state) {
              this.address = response.address.state; // Lấy tên tỉnh/thành phố
            } else if (response.address.town) {
              this.address = response.address.town; // Lấy tên thị trấn
            } else {
              this.address = 'Không tìm thấy thành phố';
            }
          } else {
            this.address = 'Không tìm thấy địa chỉ';
          }
          this.getCinemas(this.address)
        },
        error: (error) => {
          console.error('Lỗi lấy địa chỉ:', error);
          this.address = 'Lỗi khi lấy địa chỉ';
        }
      });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { LocationService } from '../../Service/location.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-movie-theatres',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-theatres.component.html',
  styleUrls: ['./movie-theatres.component.css']
})
export class MovieTheatresComponent implements OnInit {
  provinces: any[] = [];
  latitude: number | null = null;
  longitude: number | null = null;
  address: string = '';

  constructor(private locationService: LocationService, private http: HttpClient) {}

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

  // API Nominatim để lấy địa chỉ từ tọa độ
  private nominatimUrl = 'https://nominatim.openstreetmap.org/reverse';

  getAddressFromCoordinates() {
    if (this.latitude !== null && this.longitude !== null) {
      const url = `${this.nominatimUrl}?lat=${this.latitude}&lon=${this.longitude}&format=json`;

      this.http.get(url).subscribe({
        next: (response: any) => {
          if (response && response.display_name) {
            this.address = response.display_name;
          } else {
            this.address = 'Không tìm thấy địa chỉ';
          }
        },
        error: (error) => {
          console.error('Lỗi lấy địa chỉ:', error);
          this.address = 'Lỗi khi lấy địa chỉ';
        }
      });
    }
  }
}

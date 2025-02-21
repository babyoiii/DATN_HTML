import { Component, OnInit } from '@angular/core';
import { LocationService } from '../../Service/location.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-movie-theatres',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-theatres.component.html',
  styleUrls: ['./movie-theatres.component.css']
})
export class MovieTheatresComponent implements OnInit {
  provinces: any[] = [];

  constructor(private locationService: LocationService,private http : HttpClient) {}

  ngOnInit(): void {
    this.loadProvinces();
    this.getAddressFromCoordinates();
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
  latitude: number | null = null;
  longitude: number | null = null;
 address: string = '';
 getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        console.log('Latitude:', this.latitude, 'Longitude:', this.longitude);

        // Sau khi lấy tọa độ thành công, gọi API để lấy địa chỉ
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

getAddressFromCoordinates() {
  if (this.latitude !== null && this.longitude !== null) {
    const apiKey = 'AIzaSyAeYO_rASXqQPfudjSuxavk11tO9swMEWo'; 
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.latitude},${this.longitude}&key=${apiKey}`;

    this.http.get(url).subscribe({
      next: (response: any) => {
        if (response.results.length > 0) {
          this.address = response.results[0].formatted_address;
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
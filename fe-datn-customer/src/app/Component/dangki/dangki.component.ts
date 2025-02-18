import { Component } from '@angular/core';
import { SignUp } from '../../Models/AuthModel';
import { AuthServiceService } from '../../Service/auth-service.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-dangki',
  standalone: true,
  imports: [CommonModule,FormsModule,GoogleMapsModule,RouterModule],
  templateUrl: './dangki.component.html',
  styleUrls: ['./dangki.component.css']
})
export class DangkiComponent {
  _signUpData: SignUp = {
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    address: '',
    dob: new Date(),
    sex: 0
  };
  latitude!: number;
  longitude!: number;
  currentAddress: string = '';

  constructor(private AuthService: AuthServiceService, private http: HttpClient) {}

  reverseGeocode(lat: number, lng: number) {
    const apiKey = 'AIzaSyAcUS6GY5z-M_m84265uKHB23paEbOD9BA'; // Replace with your actual API key
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    this.http.get(url).subscribe((res: any) => {
      if (res?.results?.length > 0) {
        // Get the first address
        this.currentAddress = res.results[0].formatted_address;
        console.log('Current address: ', this.currentAddress);
      }
    });
  }

  getCurrentLocation() {
    console.log('Current address: ', this.currentAddress);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;   // Gán cho this.latitude
          this.longitude = position.coords.longitude; // Gán cho this.longitude
          this.reverseGeocode(this.latitude, this.longitude);
        },
        (error) => {
          console.error('Error in retrieving position: ', error);
        }
      );
    } else {
      console.error('Browser does not support Geolocation');
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { SignUp } from '../../Models/AuthModel';
import { AuthServiceService } from '../../Service/auth-service.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dangki',
  standalone: true,
  imports: [MatNativeDateModule,CommonModule, FormsModule, GoogleMapsModule, RouterModule,MatDatepickerModule, MatFormFieldModule, MatInputModule],
  templateUrl: './dangki.component.html',
  styleUrls: ['./dangki.component.css']
})
export class DangkiComponent implements OnInit {
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
  date: Date | null = null;
  provinces: any[] = [];
  constructor(private AuthService: AuthServiceService, private http: HttpClient,private toast : ToastrService) {}
  ngOnInit(): void {
  
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
  togglePasswordVisibility(passwordInput: HTMLInputElement): void {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text'; 
    } else {
      passwordInput.type = 'password'; 
    }
  }
  // API Nominatim để lấy địa chỉ từ tọa độ
  private nominatimUrl = 'https://nominatim.openstreetmap.org/reverse';

  getAddressFromCoordinates() {
    if (this.latitude !== null && this.longitude !== null) {
      const url = `${this.nominatimUrl}?lat=${this.latitude}&lon=${this.longitude}&format=json`;
  
      this.http.get(url).subscribe({
        next: (response: any) => {
          if (response && response.address) {
            const address = response.address;
            console.log('Địa chỉ đầy đủ:', address);
  
            // Lấy city, suburb, road, quarter
            this._signUpData.address = [
              address.road || '',    // Đường
              address.quarter || '', 
              address.suburb || '',  
              address.city || ''    
            ]
              .filter((part) => part) 
              .join(', '); 
  
            console.log('Địa chỉ rút gọn:',  this._signUpData.address);
          } else {
            this._signUpData.address = 'Không tìm thấy địa chỉ';
          }
        },
        error: (error) => {
          console.error('Lỗi lấy địa chỉ:', error);
          this._signUpData.address = 'Lỗi khi lấy địa chỉ';
        }
      });
    }
  }
  signUp(){
    console.log('Đăng ký:', this._signUpData);
  this.AuthService.SignUp(this._signUpData).subscribe({
    next: (response: any) => {
     this.toast.success('Đăng ký thành công!',"Thông báo");
    },
    error: (error: any) => {
      this.toast.error('Đăng ký thất bại! Vui lòng thử lại.');
    }
  });
}
}
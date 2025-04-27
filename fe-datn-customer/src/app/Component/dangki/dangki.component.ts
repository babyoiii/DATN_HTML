import { Component, OnInit } from '@angular/core';
import { SignUp } from '../../Models/AuthModel';
import { AuthServiceService } from '../../Service/auth-service.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { Router, RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-dangki',
  standalone: true,
  imports: [NgxSpinnerModule,MatNativeDateModule,CommonModule, FormsModule, GoogleMapsModule, RouterModule,MatDatepickerModule, MatFormFieldModule, MatInputModule],
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
    sex: 1
  };
  today: Date = new Date(); 
  latitude!: number;
  longitude!: number;
  currentAddress: string = '';
  date: Date | null = null;
  provinces: any[] = [];
  constructor( private router: Router,private spinner: NgxSpinnerService,private AuthService: AuthServiceService, private http: HttpClient,private toast : ToastrService,private dialog: MatDialog) {}
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
  signUp() {
    if (!this._signUpData.email) {
      this.toast.error('Email không được để trống!', 'Lỗi');
      return;
    }
  
    if (!this._signUpData.password) {
      this.toast.error('Mật khẩu không được để trống!', 'Lỗi');
      return;
    }
  
    if (!this._signUpData.confirmPassword) {
      this.toast.error('Xác nhận mật khẩu không được để trống!', 'Lỗi');
      return;
    }
  
    if (this._signUpData.password !== this._signUpData.confirmPassword) {
      this.toast.error('Mật khẩu và xác nhận mật khẩu không khớp!', 'Lỗi');
      return;
    }
  
    if (!this._signUpData.name) {
      this.toast.error('Họ và tên không được để trống!', 'Lỗi');
      return;
    }
  
    if (!this._signUpData.phoneNumber) {
      this.toast.error('Số điện thoại không được để trống!', 'Lỗi');
      return;
    }
  
    if (!this._signUpData.dob) {
      this.toast.error('Ngày sinh không được để trống!', 'Lỗi');
      return;
    }
  
    if (!this._signUpData.sex) {
      this.toast.error('Vui lòng chọn giới tính!', 'Lỗi');
      return;
    }
  
    if (!this._signUpData.address) {
      this.toast.error('Địa chỉ không được để trống!', 'Lỗi');
      return;
    }
    this.spinner.show(); 
    this.AuthService.SignUp(this._signUpData).subscribe({
      next: (response: any) => {
        if (response.responseCode === 200) {
          this.router.navigate(['/VerifyOpt'], { queryParams: { email: this._signUpData.email } });
        }else {
          this.toast.error(response.message || 'Đăng ký thất bại!', 'Lỗi');
        }
          this.spinner.hide();
      },
      error: (error: any) => {
        this.toast.error('Đăng ký thất bại! Vui lòng thử lại.', 'Lỗi');
        this.spinner.hide(); 
      }
    });
}
}
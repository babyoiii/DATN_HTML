import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthServiceService } from '../../Service/auth-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  template: `
    <div class="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-center font-bold text-2xl text-blue-600">Xác nhận mã OTP</h2>
      <p class="text-center text-gray-600 mt-2">
        Mã OTP đã được gửi đến email của bạn. Vui lòng nhập mã để hoàn tất đăng ký.
      </p>
      <div class="mt-6">
        <input
          type="text"
          maxlength="6"
          [(ngModel)]="otpCode"
          placeholder="Nhập mã OTP"
          class="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div *ngIf="errorMessage" class="text-red-500 text-sm mt-2 text-center">
          {{ errorMessage }}
        </div>
      </div>
      <div class="flex justify-between mt-6">
        <button
          (click)="onCancel()"
          class="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-lg"
        >
          Hủy
        </button>
        <button
          (click)="onVerify()"
          class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-lg"
        >
          Xác nhận
        </button>
      </div>
    </div>
  `,
  styles: [],
  imports: [FormsModule, CommonModule],
})
export class OtpVerificationComponent {
  otpCode: string = ''; // Mã OTP người dùng nhập
  errorMessage: string = ''; // Thông báo lỗi

  constructor(
    public dialogRef: MatDialogRef<OtpVerificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, // Dữ liệu chứa email và mã OTP từ server
    private authService: AuthServiceService,
    private toast : ToastrService 
  ) {}

  // Hàm xác nhận OTP
  onVerify(): void {
    if (!this.otpCode) {
      this.errorMessage = 'Vui lòng nhập mã OTP!';
      return;
    }
    console.log('OTP Code nhập vào:', this.otpCode);
    console.log('Email:', this.data.email); 
    console.log('Email:', this.otpCode); 
    
    this.authService.VerifyOtp(this.data.email, this.otpCode).subscribe({
      next: (response: any) => {
        if (response.responseCode === 200) {
          this.dialogRef.close(true); 
        } else {
          this.errorMessage = 'Mã OTP không chính xác!';
        }
      },
      error: (error: any) => {
        console.error('Lỗi xác thực OTP:', error);
        this.errorMessage = 'Đã xảy ra lỗi khi xác thực OTP. Vui lòng thử lại!';
      }
    });
  }

  // Hàm hủy
  onCancel(): void {
    this.dialogRef.close(false); // Đóng dialog và trả về thất bại
  }
}
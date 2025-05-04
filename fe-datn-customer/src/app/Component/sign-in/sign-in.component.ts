import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../Service/auth-service.service';
import { ModalService } from '../../Service/modal.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from '../../Service/notification.service';

interface SignInData {
  userName: string;
  password: string;
}

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule, CommonModule,NgxSpinnerModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  SignInData: SignInData = {
    userName: '',
    password: ''
  };
  showPassword: boolean = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  constructor(
    private authService: AuthServiceService, 
    private router: Router,
    public modalService: ModalService,
    private toast: ToastrService,
    private spinner: NgxSpinnerService,
    private notificationService: NotificationService
  ) {}

  onSubmit(): void {
    // Hiển thị thông báo loading không có thời gian timeout
    const loadingToast = this.toast.info("Đang đăng nhập, vui lòng chờ...", "", {
      timeOut: 0,
      tapToDismiss: false,
      closeButton: false
    });
  this.spinner.show(); // Hiển thị spinner
    this.authService.SignIn(this.SignInData).subscribe({
      next: (result: any) => {
        console.log('Response:', result);
        this.toast.clear(loadingToast.toastId);

        if (result && result.data) {
          const { accessToken, refreshToken, roles } = result.data;
          console.log('Access Token:', accessToken);
          console.log('Refresh Token:', refreshToken);
          console.log('Roles:', roles);

          this.notificationService.onSuccessNotification('Đăng nhập thành công!');
          this.authService.saveToken(accessToken);
          this.authService.saveUserData(result);
          this.modalService.closeSignInModal();
          this.spinner.hide(); // Ẩn spinner
          const redirectUrl = localStorage.getItem('redirectUrl') || '/';
          localStorage.removeItem('redirectUrl');
          this.router.navigate([redirectUrl]);
        } else {
          console.error('No data found in the response');
          this.spinner.hide(); // Ẩn spinner
          this.notificationService.onErrorNotification('Không tìm thấy dữ liệu đăng nhập!');
        }
      },
      error: (error: any) => {
        this.spinner.hide(); // Ẩn spinner
        console.error('Error:', error);
        this.toast.clear(loadingToast.toastId);
        this.notificationService.onErrorNotification('Đăng nhập thất bại, vui lòng thử lại sau!');
      }
    });
  }
  
  forgotPassword(): void {
    this.router.navigate(['/sendMailForgotPassword']);
    this.modalService.closeSignInModal();
  }
  closeModal(): void {
    this.modalService.closeSignInModal();
  }
}

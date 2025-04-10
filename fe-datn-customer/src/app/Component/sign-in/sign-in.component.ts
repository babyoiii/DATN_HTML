import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../Service/auth-service.service';
import { ModalService } from '../../Service/modal.service';
import { ToastrService } from 'ngx-toastr';

interface SignInData {
  userName: string;
  password: string;
}

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  SignInData: SignInData = {
    userName: '',
    password: ''
  };

  constructor(
    private authService: AuthServiceService, 
    private router: Router,
    public modalService: ModalService,
    private toast: ToastrService
  ) {}

  onSubmit(): void {
    // Hiển thị thông báo loading không có thời gian timeout
    const loadingToast = this.toast.info("Đang đăng nhập, vui lòng chờ...", "", {
      timeOut: 0,
      tapToDismiss: false,
      closeButton: false
    });

    this.authService.SignIn(this.SignInData).subscribe({
      next: (result: any) => {
        console.log('Response:', result);
        this.toast.clear(loadingToast.toastId);

        if (result && result.data) {
          const { accessToken, refreshToken, roles } = result.data;
          console.log('Access Token:', accessToken);
          console.log('Refresh Token:', refreshToken);
          console.log('Roles:', roles);

          this.toast.success('Đăng nhập thành công!');
          this.authService.saveToken(accessToken);
          this.authService.saveUserData(result);
          this.modalService.closeSignInModal();
          this.router.navigate(['/']); 
        } else {
          console.error('No data found in the response');
          this.toast.error('Không tìm thấy dữ liệu đăng nhập!');
        }
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.toast.clear(loadingToast.toastId);
        this.toast.error('Đăng nhập thất bại, vui lòng thử lại sau!');
      }
    });
  }

  closeModal(): void {
    this.modalService.closeSignInModal();
  }
}

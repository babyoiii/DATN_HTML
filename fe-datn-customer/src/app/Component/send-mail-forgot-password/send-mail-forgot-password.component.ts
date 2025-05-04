import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthServiceService } from '../../Service/auth-service.service';
import { Router } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from '../../Service/notification.service';

@Component({
  selector: 'app-send-mail-forgot-password',
  standalone: true,
  imports: [FormsModule,NgxSpinnerModule],
  templateUrl: './send-mail-forgot-password.component.html',
  styleUrl: './send-mail-forgot-password.component.css'
})
export class SendMailForgotPasswordComponent {
  email: string = ''; 

  constructor(private notificationService : NotificationService,private authService: AuthServiceService, private router: Router,private spinner: NgxSpinnerService) {}

  onSubmit(): void {
    if (!this.email || !this.isValidEmail(this.email)) {
      this.notificationService.onErrorNotification('Vui lòng nhập một địa chỉ email hợp lệ.');
      return;
    }
  
    this.spinner.show();
    this.authService.ForgotPassword(this.email).subscribe({
      next: (response) => {
        if (response.responseCode === 200) {
          this.notificationService.onSuccessNotification('Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.');
          this.router.navigate(['/resetPassword'], { queryParams: { email: this.email } });
        } else {
          this.notificationService.onErrorNotification(`${response.message}`);
        }
        this.spinner.hide();
      },
      error: (err) => {
        this.notificationService.onErrorNotification('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        this.spinner.hide();
      }
    });
  }
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    return emailRegex.test(email);
  }

  onBackToHome(): void {
    this.router.navigate(['/']); 
  }
}

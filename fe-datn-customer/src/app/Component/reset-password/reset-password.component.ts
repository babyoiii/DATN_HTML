import { Component, OnInit } from '@angular/core';
import { AuthServiceService } from '../../Service/auth-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from '../../Service/notification.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordData = {
    email: '',
    token: '',
    newPassword: ''
  };

  constructor(private notificationService : NotificationService,private authService: AuthServiceService,private spinner: NgxSpinnerService, private router: Router, private route: ActivatedRoute) {}
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.resetPasswordData.email = params['email'] || '';
      console.log('Email nhận được:', this.resetPasswordData.email);
    });
  }
  onBackToHome(): void {
    this.router.navigate(['/']); 
  }
  onSubmit(): void {
    if (!this.resetPasswordData.email || !this.resetPasswordData.token || !this.resetPasswordData.newPassword) {
      this.notificationService.onWarningNotification('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    this.spinner.show(); 
    this.authService.ResetPassword(this.resetPasswordData).subscribe({
      next: (response) => {
        if (response.responseCode === 200) {
          this.notificationService.onSuccessNotification('Mật khẩu của bạn đã được đặt lại thành công.');
          this.spinner.hide();
          this.router.navigate(['/']); 
        } else {
          this.spinner.hide();
          this.notificationService.onErrorNotification(`Lỗi: ${response.message}`);
        }
      },
      error: (err) => {
        this.spinner.hide();
        this.notificationService.onErrorNotification('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    });
  }}
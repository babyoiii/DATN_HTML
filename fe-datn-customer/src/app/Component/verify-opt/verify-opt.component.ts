import { AfterViewInit, Component, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthServiceService } from '../../Service/auth-service.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from '../../Service/notification.service';

@Component({
  selector: 'app-verify-opt',
  standalone: true,
  imports: [NgxSpinnerModule],
  templateUrl: './verify-opt.component.html',
  styleUrls: ['./verify-opt.component.css']
})
export class VerifyOptComponent implements AfterViewInit {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  otpCode: string = '';
  email: string = '';

  constructor(
    private authService: AuthServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastrService,
    private spinner: NgxSpinnerService ,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      if (!this.email) {
        this.notificationService.onErrorNotification('Email không hợp lệ!');
        this.router.navigate(['/dangki']);
      }
    });
  }

  ngAfterViewInit(): void {
    this.otpInputs.forEach((input, index, arr) => {
      input.nativeElement.addEventListener('input', () => {
        const value = input.nativeElement.value;
        if (value.length === 1 && index < arr.length - 1) {
          arr[index + 1].nativeElement.focus();
        }
        this.updateOtpCode();
      });

      input.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Backspace' && index > 0 && input.nativeElement.value === '') {
          arr[index - 1].nativeElement.focus();
        }
      });
    });
  }

  updateOtpCode(): void {
    this.otpCode = this.otpInputs.map(input => input.nativeElement.value).join('');
  }

  verifyOTP(): void {

    if (this.otpCode.length !== 6) {
      this.notificationService.onErrorNotification('Vui lòng nhập đầy đủ mã OTP!');
      return;
    }
    this.spinner.show(); 
    this.authService.VerifyOtp(this.email, this.otpCode).subscribe({
      next: (response: any) => {
        if (response.responseCode === 200) {
          this.notificationService.onSuccessNotification('Xác thực OTP thành công!');
          this.router.navigate(['/']);
        } else {
          this.notificationService.onErrorNotification(response.message || 'Xác thực OTP thất bại!');
        }
        this.spinner.hide()
      },
      error: (error: any) => {
        console.error('Lỗi xác thực OTP:', error);
        this.spinner.hide()
        this.notificationService.onErrorNotification('Xác thực OTP thất bại! Vui lòng thử lại.');
      }
    });
  }
  resendOtp(): void {
    this.spinner.show();
    this.authService.ReSendOtp(this.email).subscribe({
      next: (response: any) => {
        if (response.responseCode === 200) {
          this.notificationService.onSuccessNotification('Mã OTP đã được gửi lại!');
        } else {
          this.notificationService.onErrorNotification(response.message || 'Không thể gửi lại mã OTP!');
        }
        this.spinner.hide()
      },
      error: (error: any) => {
        console.error('Lỗi khi gửi lại OTP:', error);
        this.spinner.hide()
        this.notificationService.onErrorNotification('Lỗi khi gửi lại mã OTP! Vui lòng thử lại.');
      }
    });
  }
}
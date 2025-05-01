import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaymentMethod, PaymentModelReq } from '../../../Models/Order';
import { OrdersService } from '../../../Service/Orders.Service';
import { CommonModule } from '@angular/common';
import { MembershipService } from '../../../Service/membership.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { WalletOnboardService } from '../../../Service/wallet.servive';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../Service/notification.service';

@Component({
  selector: 'app-vip-member',
  standalone: true,
  imports: [NgxSpinnerModule, RouterLink, CommonModule,FormsModule],
  templateUrl: './vip-member.component.html',
  styleUrl: './vip-member.component.css'
})
export class VipMemberComponent implements OnInit {
  listPaymentMethod: PaymentMethod[] = [];
  email: string = '';
  usdcPriceUSD: number | null = null; // Giá USDC theo USD
  usdcPriceVND: number | null = null; // Giá USDC theo VND
  totalAmount: number = 0; // Tổng số tiền (VND)
  membershipId: number = 0; // ID thẻ thành viên
  selectedPaymentId: string = ''; // ID phương thức thanh toán
  selectedPaymentMethod: string | null = null; // Tên phương thức thanh toán
  walletAddress: string = ''; // Địa chỉ ví
  roundedUSDCAmount: number = 0; // Số tiền USDC đã làm tròn
  isTermsAccepted: boolean = false; 
  membershipName: string = '';
  constructor(
    private spinner: NgxSpinnerService,
    private walletService: WalletOnboardService,
    private router: Router,
    private orderService: OrdersService,
    private membershipService: MembershipService,
    private toast: ToastrService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.fetchUSDCPriceUSD();
    this.fetchUSDCPriceVND();
    this.email = localStorage.getItem('email') || '';
    this.totalAmount = Number(localStorage.getItem('membershipPriceNext')) || 0;
    this.membershipId = Number(localStorage.getItem('nextLevelBenefitsId')) || 0;
    this.membershipName = localStorage.getItem('membershipNameNext') || '';
    this.getPaymentMethod();
    console.log(this.email, 'email');
    console.log(this.totalAmount, 'totalAmount');
  }

  getPaymentMethod(): void {
    this.orderService.getPaymentMethod().subscribe({
      next: (res: any) => {
        this.listPaymentMethod = res.data;
        console.log(this.listPaymentMethod, 'Payment Method');
      },
      error: (error) => {
        console.error('Error getting payment methods:', error);
      }
    });
  }

  onPaymentMethodChange(method: string): void {
    this.selectedPaymentId = method;
    this.selectedPaymentMethod = this.listPaymentMethod.find(item => item.id === method)?.paymentMethodName || null;

    if (this.selectedPaymentMethod === 'MULTI-WALLET') {
      const usdcAmount = this.convertVNDToUSDC(this.totalAmount);
      if (usdcAmount !== null) {
        this.roundedUSDCAmount = parseFloat(usdcAmount.toFixed(6)); // Làm tròn đến 6 chữ số thập phân
        console.log('Total Amount in USDC:', this.roundedUSDCAmount);
      } 
    } else {
      this.roundedUSDCAmount = 0; // Đặt lại giá trị nếu không phải MULTI-WALLET
    }
  }

  addMembership(): void {
    if (this.selectedPaymentId === '') {
      this.notificationService.onErrorNotification('Vui lòng chọn phương thức thanh toán:');
      return;
    }
    if (!this.isTermsAccepted) {
      this.notificationService.onErrorNotification('Bạn phải đồng ý với điều khoản trước khi thanh toán.');
      return;
    }
    console.log(this.selectedPaymentId, 'selectedPaymentId');
    if (this.selectedPaymentMethod === 'VNPAY') {
      this.handleVNPayPayment();
    } else if (this.selectedPaymentMethod === 'MULTI-WALLET') {
      this.handleMultiWalletPayment();
    }
  }

  private handleVNPayPayment(): void {
    const paymentData: PaymentModelReq = {
      amount: Math.round(this.totalAmount),
      orderDesc: 'Thanh toán đơn hàng',
      createdDate: new Date().toISOString(),
      status: 'Pending',
      paymentTranId: 0,
      bankCode: 'VCB',
      payStatus: 'Pending',
      orderInfo: 'Thông tin đơn hàng'
    };

    this.orderService.createPayment(paymentData).subscribe({
      next: (response: any) => {
        if (response.responseCode === 1) {
          const callbackWindow = window.open(response.data, '_blank');
          let paymentSuccess = false;

          const messageListener = (event: MessageEvent) => {
            if (!event.data || !event.data.type) return;

            if (event.data.type === 'PAYMENT_SUCCESS') {
              paymentSuccess = true;
              const payload = {
                membershipId: this.membershipId,
                paymentMethodId: this.selectedPaymentId
              };
              this.membershipService.addUserMembership(payload).subscribe({
                next: () => {
                  this.notificationService.onSuccessNotification('Mua thẻ thành viên thành công:');
                  this.spinner.hide();
                  this.router.navigate(['/my-cinex']);
                },
                error: (error) => {
                  this.spinner.hide();
                  this.notificationService.onErrorNotification('Error adding membership:' + error );
                }
              });
              this.notificationService.onSuccessNotification('✅ Thanh toán thành công!');
            } else if (event.data.type === 'PAYMENT_FAILED') {
              this.notificationService.onErrorNotification('❌ Thanh toán thất bại.');
            }

            if (callbackWindow) {
              callbackWindow.close();
            }
            window.removeEventListener('message', messageListener);
          };

          window.addEventListener('message', messageListener);

          const checkWindowClosed = setInterval(() => {
            if (callbackWindow && callbackWindow.closed) {
              clearInterval(checkWindowClosed);
              if (!paymentSuccess) {
                this.notificationService.onErrorNotification('❌ Thanh toán thất bại do cửa sổ bị đóng.');
                this.spinner.hide();
              }
            }
          }, 500);
        } else {
          this.notificationService.onErrorNotification('❌ Lỗi khi tạo thanh toán:');
          this.spinner.hide();
        }
      },
      error: (error) => {
        console.error('Error creating payment:', error);
        this.notificationService.onErrorNotification('❌ Lỗi khi tạo thanh toán:');
        this.spinner.hide();
      }
    });
  }

  private handleMultiWalletPayment(): void {
    this.walletService.connectWallet()
      .then((walletAddress) => {
        if (!walletAddress) {
          this.notificationService.onErrorNotification('Không thể kết nối ví. Vui lòng thử lại.');
          this.spinner.hide();
          return;
        }
        this.walletAddress = walletAddress;
  
        if (this.roundedUSDCAmount <= 0) {
          this.notificationService.onErrorNotification('Số tiền USDC không hợp lệ. Vui lòng thử lại.');
          this.spinner.hide();
          return;
        }
        this.spinner.show();
        return this.walletService.makePayment(this.roundedUSDCAmount.toString());
      })
      .then((txHash) => {
        if (txHash && typeof txHash === 'string') {
          const payload = {
            membershipId: this.membershipId,
            paymentMethodId: this.selectedPaymentId
          };
          this.membershipService.addUserMembership(payload).subscribe({
            next: () => {
              this.notificationService.onSuccessNotification('Mua thẻ thành viên thành công:');
              this.spinner.hide();
              this.router.navigate(['/my-cinex']);
            },
            error: (error) => {
              this.spinner.hide();
              this.notificationService.onErrorNotification('Error adding membership:' + error, );
            }
          });
        } else {
          this.notificationService.onErrorNotification('Giao dịch không hợp lệ. Vui lòng thử lại.');
          this.spinner.hide();
        }
      })
      .catch((error) => {
        console.error('Error during wallet payment:', error);
      
        // Trích xuất thông báo lỗi từ error.message hoặc error.reason
        let errorMessage = error?.message || 'Đã xảy ra lỗi trong quá trình thanh toán.';
      
        // Kiểm tra nếu lỗi có chứa thông tin "reason" (thường là lý do từ hợp đồng thông minh)
        if (error?.reason) {
          errorMessage = error.reason;
        }
      
        // Kiểm tra nếu lỗi có chứa thông tin "revert" (thông báo từ hợp đồng thông minh)
        if (error?.revert?.args && error.revert.args.length > 0) {
          errorMessage = error.revert.args[0];
        }
      
        // Hiển thị thông báo lỗi chi tiết
        this.notificationService.onErrorNotification(`Lỗi giao dịch: ${errorMessage}`);
        this.spinner.hide();
      });
  }

  convertVNDToUSDC(vndAmount: number): number | null {
    if (this.usdcPriceVND && this.usdcPriceVND > 0) {
      const usdcAmount = vndAmount / this.usdcPriceVND;
      if (usdcAmount < 0.005) {
        return null;
      }
      return parseFloat(usdcAmount.toFixed(6));
    }
    return null;
  }

  fetchUSDCPriceUSD(): void {
    this.orderService.getUSDCPriceUSD().subscribe({
      next: (price) => {
        if (price && price > 0) {
          this.usdcPriceUSD = price;
          console.log('USDC Price in USD:', this.usdcPriceUSD);
        } else {
          this.notificationService.onErrorNotification('Không thể lấy giá USDC theo USD. Vui lòng thử lại.');
        }
      },
      error: (error) => {
        console.error('Error fetching USDC price in USD:', error);
        this.notificationService.onErrorNotification('Lỗi khi lấy giá USDC theo USD.');
      }
    });
  }

  fetchUSDCPriceVND(): void {
    this.orderService.getUSDCPriceVND().subscribe({
      next: (price) => {
        if (price && price > 0) {
          this.usdcPriceVND = price;
          console.log('USDC Price in VND:', this.usdcPriceVND);
        } else {
          this.notificationService.onErrorNotification('Không thể lấy giá USDC theo VND. Vui lòng thử lại.');
        }
      },
      error: (error) => {
        console.error('Error fetching USDC price in VND:', error);
       this.notificationService.onErrorNotification('Lỗi khi lấy giá USDC theo VND.');
      }
    });
  }
}
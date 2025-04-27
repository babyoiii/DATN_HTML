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
import { log } from 'console';

@Component({
  selector: 'app-vip-member',
  standalone: true,
  imports: [NgxSpinnerModule,RouterLink,CommonModule],
  templateUrl: './vip-member.component.html',
  styleUrl: './vip-member.component.css'
})
export class VipMemberComponent implements OnInit {
 listPaymentMethod : PaymentMethod[] = []
 email : string = ''
 sdcPriceUSD: number | null = null; // Giá USDC theo USD
  usdcPriceVND: number | null = null; 
 totalAmount : number = 0
 membershipId : number = 0
 selectedPaymentId : string = ''
 selectedPaymentMethod: string | null = null
 walletAddress: string = ''; // Địa chỉ ví
 roundedUSDCAmount: number = 0; 
 constructor(private spinner: NgxSpinnerService,private walletService : WalletOnboardService,private router : Router,private orderService: OrdersService,private membershipService : MembershipService,private toast : ToastrService) { }
  ngOnInit(): void {
    this.email = localStorage.getItem('email') || ''
    this.totalAmount = Number(localStorage.getItem('membershipPriceNext')) || 0
    this.membershipId = Number(localStorage.getItem('nextLevelBenefitsId')) || 0
    this.getPaymentMethod()
    console.log(this.email,'email');
    console.log(this.totalAmount,'totalAmount');
  }
  getPaymentMethod(){
    this.orderService.getPaymentMethod().subscribe({
      next:(res:any) =>{
        this.listPaymentMethod = res.data
        console.log(this.listPaymentMethod,'Payment Method');

      },
      error: (error) => {
        console.error('Error get payment:', error);
      }
    })
  }
  addMembership(): void {
    if (this.selectedPaymentId == '') {
      this.toast.error('Vui lòng chọn phương thức thanh toán:', "Thông báo");
      return
    }
    console.log(this.selectedPaymentId,'selectedPaymentId');
    if (this.selectedPaymentMethod === 'VNPAY') {
      this.handleVNPayPayment();
    } else if (this.selectedPaymentMethod == 'MULTI-WALLET') {
      this.handleMultiWalletPayment();
    }
  
  }
  onPaymentMethodChange(method: string): void {
    this.selectedPaymentId = method;
    this.selectedPaymentMethod = this.listPaymentMethod.find(item => item.id === method)?.paymentMethodName || null;
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
        let paymentSuccess = false; // Biến để theo dõi trạng thái thanh toán

        const messageListener = (event: MessageEvent) => {
          if (!event.data || !event.data.type) return;

          if (event.data.type === 'PAYMENT_SUCCESS') {
            paymentSuccess = true; // Đánh dấu thanh toán thành công
            const payload = {
              membershipId: this.membershipId,
              paymentMethodId: this.selectedPaymentId
            };
            this.membershipService.addUserMembership(payload).subscribe({
              next: (response) => {
                this.toast.success('Mua thẻ thành viên thành công:', "Thông báo");
                this.spinner.hide();
                this.router.navigate(['/my-cinex']);
              },
              error: (error) => {
                this.spinner.hide();
                this.toast.error('Error adding membership:', error);
              }
            });
            this.toast.success('✅ Thanh toán thành công!', "Thông Báo");
          } else if (event.data.type === 'PAYMENT_FAILED') {
            this.toast.error('❌ Thanh toán thất bại.', "Thông Báo");
          }

          // Đóng cửa sổ thanh toán và xóa listener
          if (callbackWindow) {
            callbackWindow.close();
          }
          window.removeEventListener('message', messageListener);
        };

        window.addEventListener('message', messageListener);

        // Kiểm tra trạng thái của cửa sổ thanh toán
        const checkWindowClosed = setInterval(() => {
          if (callbackWindow && callbackWindow.closed) {
            clearInterval(checkWindowClosed); // Dừng kiểm tra
            if (!paymentSuccess) {
              this.toast.error('❌ Thanh toán thất bại do cửa sổ bị đóng.', "Thông Báo");
              this.spinner.hide();
            }
          }
        }, 500); // Kiểm tra mỗi 500ms
      } else {
        this.toast.error('❌ Lỗi khi tạo thanh toán:', 'Thông Báo');
        this.spinner.hide();
      }
    },
    error: (error) => {
      console.error('Error creating payment:', error);
      this.toast.error('❌ Lỗi khi tạo thanh toán:', 'Thông Báo');
      this.spinner.hide();
    }
  });
}
private handleMultiWalletPayment(): void {
  this.walletService.connectWallet()
    .then((walletAddress) => {
      if (!walletAddress) {
        this.toast.error('Không thể kết nối ví. Vui lòng thử lại.');
        this.spinner.hide();
        return;
      }
      this.walletAddress = walletAddress;

      // const usdcAmount = this.convertVNDToUSDC(this.totalAmount);
      // if (usdcAmount === null) {
      //   this.toast.error('Không thể chuyển đổi VND sang USDC. Vui lòng thử lại.');
      //   this.spinner.hide();
      //   return;
      // }

      // this.roundedUSDCAmount = parseFloat(usdcAmount.toFixed(6));
      // if (isNaN(this.roundedUSDCAmount) || this.roundedUSDCAmount <= 0) {
      //   this.toast.error('Số tiền USDC không hợp lệ. Vui lòng thử lại.');
      //   this.spinner.hide();
      //   return;
      // }

      return this.walletService.makePayment(this.roundedUSDCAmount.toString());
    })
    .then((txHash) => {
      if (txHash && typeof txHash === 'string') {
        const orderData = {
          transactionCode: txHash,
          totalPriceMethod: this.roundedUSDCAmount.toString()
        };

      //   this.orderService.createOrder(orderData).subscribe({
      //     next: (response: any) => {
      //       if (response.responseCode !== 200) {
      //         this.toast.error('❌ Đơn hàng không thành công:', "Thông Báo");
      //         this.spinner.hide();
      //         return;
      //       }

      //       this.toast.success('Đơn hàng đã được tạo thành công!', 'Thông Báo');
      //       this.spinner.hide();
      //       this.router.navigate(['/']);
      //     },
      //     error: (error) => {
      //       console.error('Error creating order:', error);
      //       this.toast.error('❌ Lỗi khi tạo đơn hàng.', 'Thông Báo');
      //       this.spinner.hide();
      //     }
      //   });
      // } else {
      //   this.toast.error('Giao dịch không hợp lệ. Vui lòng thử lại.');
      //   this.spinner.hide();
     }
    })
    .catch((error) => {
      console.error('Error during wallet payment:', error);
      this.toast.error('Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.');
      this.spinner.hide();
    });
}

}
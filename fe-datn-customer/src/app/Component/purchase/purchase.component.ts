import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrdersService } from '../../Service/Orders.Service';
import { OrderModelReq, PaymentMethod, PaymentModelReq } from '../../Models/Order';
import { SeatService } from '../../Service/seat.service';
import { ModalService } from '../../Service/modal.service';
import { AuthServiceService } from '../../Service/auth-service.service';
import { WalletOnboardService } from '../../Service/wallet.servive';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.css']
})
export class PurchaseComponent implements OnInit {
  countdown: string | null = null;
  seats: { type: string; count: number; total: number; seatIds: string[] }[] = [];
  services: { id: string; name: string; price: number; quantity: number }[] = [];
  totalAmount: number = 0;
  totalTicketPrice: number = 0;
  totalServiceAmount: number = 0;
  fee: number = 0;
  email: string = '';
  selectedPaymentMethod: string | null = null; 
  walletAddress: string | null = null;
  listPaymentMethod : PaymentMethod[] = []
  usdcPriceUSD: number | null = null; // Giá USDC theo USD
  usdcPriceVND: number | null = null; // Giá USDC theo VND
  isLoggedIn: boolean = false;
  private subscription!: Subscription;
  isOpen = false;
  constructor(
    private seatService: SeatService,
    private cdr: ChangeDetectorRef,
    private orderService: OrdersService,
    private toastr: ToastrService,
    private router: Router,
    private modalService: ModalService,
    private authServiceService: AuthServiceService,
    private walletService : WalletOnboardService
  ) {}

  ngOnInit(): void {
    this.getPaymentMethod()
    this.fetchUSDCPriceUSD();
    this.fetchUSDCPriceVND();
    this.subscription = this.authServiceService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      console.log('Login status from BehaviorSubject:', status);
    });
    if (this.isLoggedIn) {
      this.email = localStorage.getItem('email') || ''; 
    }
    this.seatService.getJoinRoomMessages().subscribe({
      next: (count) => {
        if (count !== null) {
          const minutes = Math.floor(count / 60);
          const seconds = count % 60;
          this.countdown = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          this.cdr.markForCheck();
          if (count === 0) {
            this.notifyAndRedirect();
          }
        }
      },
      error: (err) => console.error('❌ Lỗi khi nhận countdown:', err)
    });

    this.loadData();
  }
  openSignIn() {
    this.modalService.openSignInModal();
  }
  private notifyAndRedirect(): void {
    this.toastr.warning('Thời gian giữ ghế đã hết, bạn sẽ được chuyển hướng.', 'Cảnh báo');
    setTimeout(() => {
      this.router.navigate(['/']); 
    }, 3000); 
  }
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
    }
  }
  onPaymentMethodChange(method: string): void {
    this.selectedPaymentMethod = this.listPaymentMethod.find(item => item.id === method)?.paymentMethodName || null;
    console.log('Selected Payment Method:', this.selectedPaymentMethod);
  }

  toggleAccordion() {
    this.isOpen = !this.isOpen;
  }
  checkLogin(): boolean {
    const logged = this.authServiceService.isLoggedIn();
    return logged;
  }
  loadData() {
    const orderDataString = localStorage.getItem('orderData');
    if (orderDataString) {
      try {
        const orderData = JSON.parse(orderDataString);

        this.seats = Object.entries(orderData.seats).map(([type, data]: any) => ({
          type: data.type,
          count: data.count,
          total: data.total,
          seatIds: data.seatIds || []
        }));

        this.services = orderData.services || [];
        this.totalAmount = orderData.totalAmount || 0;
        this.totalTicketPrice = orderData.totalTicketPrice || 0;
        this.totalServiceAmount = orderData.totalServiceAmount || 0;
        this.fee = orderData.fee || 0;

      } catch (error) {
        console.error('❌ Lỗi khi parse dữ liệu order:', error);
      }
    } else {
      console.warn('⚠️ Không tìm thấy dữ liệu order trong localStorage.');
    }
  }
  fetchUSDCPriceUSD(): void {
    this.orderService.getUSDCPriceUSD().subscribe({
      next: (price) => {
        this.usdcPriceUSD = price;
        console.log('USDC Price in USD:', this.usdcPriceUSD);
      },
      error: (error) => {
        console.error('Error fetching USDC price in USD:', error);
      }
    });
  }

  fetchUSDCPriceVND(): void {
    this.orderService.getUSDCPriceVND().subscribe({
      next: (price) => {
        this.usdcPriceVND = price;
        console.log('USDC Price in VND:', this.usdcPriceVND);
      },
      error: (error) => {
        console.error('Error fetching USDC price in VND:', error);
      }
    });
  }
  onPurchase() {
    if (!this.email) {
      this.toastr.warning('Vui lòng nhập email.');
      return;
    }

    const allSeatIds = this.seats.flatMap(seat => seat.seatIds);
    const orderData: OrderModelReq = {
      email: this.email,
      isAnonymous: 0,
      paymentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      services: this.services.map(service => ({
        serviceId: service.id,
        quantity: service.quantity
      })),
      tickets: allSeatIds.map(seatId => ({
        seatByShowTimeId: seatId
      })),
    };
    localStorage.setItem('orderDataPayment', JSON.stringify(orderData));
    const paymentData: PaymentModelReq = {
      orderId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      amount: Math.round(this.totalAmount), // Ensure amount is an integer
      orderDesc: 'Thanh toán đơn hàng',
      createdDate: new Date().toISOString(),
      status: 'Pending',
      paymentTranId: 0, // Replace with actual transaction ID
      bankCode: 'VCB', // Replace with actual bank code
      payStatus: 'Pending',
      orderInfo: 'Thông tin đơn hàng' // Add orderInfo field
    };

    console.log('Order data payment:', paymentData);
    this.createPayment(paymentData);
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
  convertVNDToUSDC(vndAmount: number): number | null {
    if (this.usdcPriceUSD && this.usdcPriceVND) {
      const usdcPriceInVND = this.usdcPriceVND; // Giá 1 USDC theo VND
      return vndAmount / usdcPriceInVND; // Chuyển đổi từ VND sang USDC
    }
    return null; 
  }
  createPayment(paymentData: PaymentModelReq) {
    if (this.selectedPaymentMethod === 'VNPAY') {
      this.orderService.createPayment(paymentData).subscribe({
        next: (response: any) => {
          console.log('Payment response:', response);
          if (response.responseCode === 1) {
            window.location.href = response.data;
          } else {
            this.toastr.error('❌ Lỗi khi tạo thanh toán:', "Thông Báo");
          }
        },
        error: (error) => {
          console.error('Error creating payment:', error);
          this.toastr.error('❌ Lỗi khi tạo thanh toán:', "Thông Báo");
        }
      });
    } else if (this.selectedPaymentMethod === 'MULTI-WALLET') {
      this.walletService.connectWallet()
        .then((walletAddress) => {
          if (!walletAddress) {
            console.error('Failed to connect wallet.');
            this.toastr.error('Failed to connect wallet.');
            return;
          }
  
          this.walletAddress = walletAddress;
          console.log('Wallet connected:', this.walletAddress);
  
          // Chuyển đổi từ VND sang USDC
          const usdcAmount = this.convertVNDToUSDC(this.totalAmount);
          if (usdcAmount === null) {
            this.toastr.error('Không thể chuyển đổi VND sang USDC. Vui lòng thử lại.');
            return;
          }
  
          const roundedUSDCAmount = parseFloat(usdcAmount.toFixed(6));
          if (isNaN(roundedUSDCAmount) || roundedUSDCAmount <= 0) {
            this.toastr.error('Invalid USDC amount. Please try again.');
            return;
          }
          console.log('Converted USDC amount (rounded):', roundedUSDCAmount);
  
          // Gọi hàm makePayment sau khi kết nối ví thành công
          return this.walletService.makePayment(roundedUSDCAmount.toString());
        })
        .then(() => {
          this.toastr.success('Payment successful!');
        })
        .catch((error) => {
          console.error('Error during wallet connection or payment:', error);
          this.toastr.error('An error occurred during the payment process. Please try again.');
        });
    }
  }
}
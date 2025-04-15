import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrdersService } from '../../Service/Orders.Service';
import { OrderModelReq, PaymentMethod, PaymentModelReq, TicketReq } from '../../Models/Order';
import { SeatService, SeatStatusUpdateRequest } from '../../Service/seat.service';
import { ModalService } from '../../Service/modal.service';
import { AuthServiceService } from '../../Service/auth-service.service';
import { WalletOnboardService } from '../../Service/wallet.servive';
import { Subscription } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { NeedMoreTimeComponent } from "../need-more-time/need-more-time.component";
import { TimeUpComponent } from "../time-up/time-up.component";
import { MembershipService } from '../../Service/membership.service';
import { Log } from 'ethers';

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [CommonModule, FormsModule, NeedMoreTimeComponent, TimeUpComponent],
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.css'],
  animations: [
    trigger('slideToggle', [
      transition(':enter', [
        style({ height: '0px', opacity: 0 }), 
        animate('500ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ height: '*', opacity: 1 })) 
      ]),
      transition(':leave', [
        animate('400ms ease-in-out', style({ height: '0px', opacity: 0 }))
      ])
    ])
  ]
})
export class PurchaseComponent implements OnInit,OnDestroy {
  countdown: string | null = null;
  seats: { type: string; count: number; total: number; seatIds: string[] }[] = [];
  services: { id: string; name: string; price: number; quantity: number }[] = [];
  totalAmount: number = 0;
  totalTicketPrice: number = 0;
  totalServiceAmount: number = 0;
  fee: number = 0;
  email: string = '';
  selectedPaymentMethod: string | null = null; 
  selectedPaymentId: string | null = null; 
  walletAddress: string | null = null;
  listPaymentMethod : PaymentMethod[] = []
  usdcPriceUSD: number | null = null; // Giá USDC theo USD
  usdcPriceVND: number | null = null; // Giá USDC theo VND
  isLoggedIn: boolean = false;
  roundedUSDCAmount: number = 0; // Declare roundedUSDCAmount property
  private subscription!: Subscription;
  isOpen = false;
  displayAmount: string = ''; // Biến để hiển thị số tiền
  displayCurrency: string = ''; // Biến để hiển thị đơn vị tiền tệ
  voucherCode: string | null = null;
  discountAmount: number = 0;
  pointWillEarn: number = 0;
  freeService: string[] | null = null;
  userId: string | null = null;
  
  voucherList = [
    {
      code: 'CineXBANMOI',
      name: 'Vé CineX đồng giá 60k cho tất cả KH',
      status: null,
      expiry: '31/12/2025'
    },
    {
      code: 'CineXBANTHAN',
      name: 'Giảm 25% hóa đơn',
      status: 'Chưa thỏa mãn điều kiện',
      expiry: '31/12/2025'
    }
  ];

  selectedVoucher: string | null = null;

  toggleVoucherDetail(code: string) {
      this.selectedVoucher = this.selectedVoucher === code ? null : code;
  }

  showVoucherDetail(code: string) {
      this.selectedVoucher = code;
  }

  hideVoucherDetail() {
      // Nếu muốn giữ popup khi click, hãy comment dòng này
      this.selectedVoucher = null;
  }

  copyVoucherCode(code: string) {
    navigator.clipboard.writeText(code);
    this.toastr.success('Đã sao chép mã giảm giá!');
  }

  applyVoucher(code: string) {
    this.voucherCode = code;
    
  }
    isTermsAccepted: boolean = false; // Trạng thái checkbox 1
  isAgeConfirmed: boolean = false; // Trạng thái checkbox 2
  constructor(
    private seatService: SeatService,
    private cdr: ChangeDetectorRef,
    private orderService: OrdersService,
    private toastr: ToastrService,
    private router: Router,
    private modalService: ModalService,
    private authServiceService: AuthServiceService,
    private walletService : WalletOnboardService,
    private membershipService: MembershipService
  ) {}
  ngOnDestroy(): void {
    this.seatService.resetWarning();
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
  }

  ngOnInit(): void {
    this.onCheckMembership();
    this.getPaymentMethod()
    this.fetchUSDCPriceUSD();
    this.fetchUSDCPriceVND();
    this.subscription = this.authServiceService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
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
          if (count === 60 && !this.seatService.hasShownWarning()) {
            this.AddMoreTime();
            this.autoCloseTimer = setTimeout(() => {
              this.modalService.closeNeedMoreTimeModal();
            }, 5000);
          }
          if (count === 0) {
            this.TimeUp();
          }
        }
      },
    });

    this.loadData();
    this.applyMembershipDiscount();
  }
  checkMembership : boolean = false;
  onCheckMembership() {
    if (this.isLoggedIn) {
      this.membershipService.checkMembership().subscribe({
        next: (res) => {
          this.checkMembership = res.data.isMemberShip;
          if (this.checkMembership) {
            this.applyMembershipDiscount();
          }
        },
        error: (error) => {
          console.error('Error checking membership:', error);
        }
      });
    } 
  }
 
  openSignIn() {
    this.modalService.openSignInModal();
  }
  onCheckboxChange(): void {
    if (this.isTermsAccepted && this.isAgeConfirmed) {
      console.log('Cả hai checkbox đã được tick.');
    }
  }
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
    }
  }
  onDisconnect(){
    this.seatService.disconnect()
  }
  applyMembershipDiscount(): void {
    if (!this.totalAmount || !this.totalTicketPrice) {
      return;
    }
    this.membershipService.getPriceMembershipPreview(this.totalAmount, this.totalTicketPrice).subscribe({
      next: (response : any) => {
        if (response.responseCode === 200) {
          const discountData = response.data;
         this.discountAmount = discountData.discountAmount;
          this.pointWillEarn = discountData.pointWillEarn;
          this.freeService = discountData.freeService;
          console.log('List', this.freeService);
          this.updateTotals(); 
        } else {
        }
      },
      error: (error) => {
      }
    });
  }
  onPaymentMethodChange(method: string): void {
    this.selectedPaymentId = method;
    this.selectedPaymentMethod = this.listPaymentMethod.find(item => item.id === method)?.paymentMethodName || null;

    if (this.selectedPaymentMethod === 'MULTI-WALLET') {
      const usdcAmount = this.convertVNDToUSDC(this.totalAmount);
      if (usdcAmount !== null) {
        this.displayAmount = usdcAmount.toFixed(6); 
        this.displayCurrency = 'USDC'; 
      } else {
        this.displayAmount = 'N/A'; 
        this.displayCurrency = 'USDC';
      }
    } else {

      this.displayAmount = this.totalAmount.toLocaleString('vi-VN');
      this.displayCurrency = 'VND'; 
    }
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

        // Cập nhật tổng số tiền
        this.updateTotals();
      } catch (error) {
      }
    } else {
    }
  }
  TimeUp(): void {
    this.modalService.openTimeUpModal();
    
  }
  private autoCloseTimer: any;

  AddMoreTime(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
    this.modalService.openNeedMoreTimeModal();
}
  fetchUSDCPriceUSD(): void {
    this.orderService.getUSDCPriceUSD().subscribe({
      next: (price) => {
        this.usdcPriceUSD = price;
      },
      error: (error) => {
      }
    });
  }

  fetchUSDCPriceVND(): void {
    this.orderService.getUSDCPriceVND().subscribe({
      next: (price) => {
        this.usdcPriceVND = price;
      },
      error: (error) => {
      }
    });
  }
  onPurchase() {
    if (!this.email) {
      this.toastr.warning('Vui lòng nhập email.');
      return;
    }
    if (this.checkLogin() === true) {
      this.userId = localStorage.getItem('userId') || null;
    }
    const allSeatIds = this.seats.flatMap(seat => seat.seatIds);
    const orderData: OrderModelReq = {
      email: this.email,
      isAnonymous: 0,
      userId: this.userId,
      transactionCode: '',
      paymentId: this.selectedPaymentId || '',
      totalPriceMethod: this.totalAmount.toString(),
      voucherCode: this.voucherCode || '',
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
      amount: Math.round(this.totalAmount), 
      orderDesc: 'Thanh toán đơn hàng',
      createdDate: new Date().toISOString(),
      status: 'Pending',
      paymentTranId: 0, 
      bankCode: 'VCB', 
      payStatus: 'Pending',
      orderInfo: 'Thông tin đơn hàng' 
    };

    console.log('Order data payment:', paymentData);
    this.createPayment(paymentData, orderData);
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
  createPayment(paymentData: PaymentModelReq, orderData: OrderModelReq) {
    if (this.selectedPaymentMethod === 'VNPAY') {
      this.orderService.createPayment(paymentData).subscribe({
        next: (response: any) => {
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
            this.toastr.error('Failed to connect wallet.');
            return;
          }
          this.walletAddress = walletAddress;
  
          // Chuyển đổi từ VND sang USDC
          const usdcAmount = this.convertVNDToUSDC(this.totalAmount);
          if (usdcAmount === null) {
            this.toastr.error('Không thể chuyển đổi VND sang USDC. Vui lòng thử lại.');
            return;
          }
            
           this.roundedUSDCAmount = parseFloat(usdcAmount.toFixed(6));
          if (isNaN(this.roundedUSDCAmount) || this.roundedUSDCAmount <= 0) {
            this.toastr.error('Invalid USDC amount. Please try again.');
            return;
          }
          // Gọi hàm makePayment sau khi kết nối ví thành công
          return this.walletService.makePayment(this.roundedUSDCAmount.toString());
        })
        .then((txHash) => {
          if (txHash && typeof txHash === 'string') {
            orderData.transactionCode = txHash; 
            orderData.totalPriceMethod = this.roundedUSDCAmount.toString();
          } else {
            this.toastr.error('Invalid transaction hash. Please try again.');
            return;
          }
          this.orderService.createOrder(orderData).subscribe({
            next: (response: any) => {
              // if (response.ResponseCode != 200){
              //   this.toastr.error('❌ Đơn hàng không thành công:' + response.Message , "Thông Báo");
              //   return;
              // }
               const seatsToUpdate: SeatStatusUpdateRequest[] = orderData.tickets.map((ticket: TicketReq) => ({
                            SeatId: ticket.seatByShowTimeId,
                            Status: 5
                          }));
              this.seatService.payment(seatsToUpdate);
              this.toastr.success('Đơn hàng đã được tạo thành công!', 'Thông Báo');
              this.router.navigate(['/']);
            },
            error: (error) => {
              console.error('Error creating order:', error);
              this.toastr.error('❌ Lỗi khi tạo đơn hàng.', 'Thông Báo');
            }
          });
        })
        .catch((error) => {
          this.toastr.error('An error occurred during the payment process. Please try again.');
        });
    }
  }
  updateTotals(): void {
    // Tính tổng tiền vé
    this.totalTicketPrice = this.seats.reduce((total, seat) => total + seat.total, 0);

    // Tính tổng tiền dịch vụ
    this.totalServiceAmount = this.services.reduce((total, service) => total + (service.price * service.quantity), 0);

    // Tính tổng tiền cuối cùng
    this.totalAmount = this.totalTicketPrice + this.totalServiceAmount - this.discountAmount;

    // Cập nhật số tiền hiển thị dựa trên phương thức thanh toán
    if (this.selectedPaymentMethod === 'MULTI-WALLET') {
      const usdcAmount = this.convertVNDToUSDC(this.totalAmount);
      if (usdcAmount !== null) {
        this.displayAmount = usdcAmount.toFixed(6);
        this.displayCurrency = 'USDC';
      } else {
        this.displayAmount = 'N/A';
        this.displayCurrency = 'USDC';
      }
    } else {
      this.displayAmount = this.totalAmount.toLocaleString('vi-VN');
      this.displayCurrency = 'VND';
    }

    console.log('Updated Totals:', {
      totalTicketPrice: this.totalTicketPrice,
      totalServiceAmount: this.totalServiceAmount,
      totalAmount: this.totalAmount,
      displayAmount: this.displayAmount,
      displayCurrency: this.displayCurrency
    });
  }
}
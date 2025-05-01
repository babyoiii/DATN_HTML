import { ChangeDetectorRef, Component, OnDestroy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
import { RewardPointData } from '../../Models/Membership';
import { UserVoucherService } from '../../Service/user-voucher.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { UserVoucher } from '../../Models/Voucher';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { NotificationService } from '../../Service/notification.service';
import { MovieByShowtimeData } from '../../Models/MovieModel';
import { ShowtimeService } from '../../Service/showtime.service';

enum VoucherType {
  Ticket = 1,         // Giảm giá cho vé xem phim
  All = 2,            // Giảm giá toàn bộ (vé + dịch vụ)
  Service = 3         // Giảm giá cho dịch vụ (combo, bắp rang, nước uống, v.v.)
}

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [CommonModule, FormsModule, NeedMoreTimeComponent, TimeUpComponent,RouterModule,NgxSpinnerModule],
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

export class PurchaseComponent implements OnInit, OnDestroy {
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
  listPaymentMethod: PaymentMethod[] = []
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
  rewardPointsInput: number = 0; // Số điểm thưởng nhập vào từ người dùng
  userVoucher: UserVoucher[] = []; // Danh sách voucher của người dùng
  currentPoints: number = 500; // Số điểm hiện tại của người dùng
  discountPointAmount: number = 0; // Số tiền có thể giảm
  type:number =0
  selectedVoucher: string | null = null;
  getRewardPoint: RewardPointData = {
    totalPoint: 0,
    pointRate: 0,
    rewardPoint: 0
  }
      movieByShowtimeData: MovieByShowtimeData = {
        thumbnail: '',
        movieName: '',
        cinemaName: '',
        cinemaAddress:'',
        startTime: '',
        startTimeFormatted: '',
        durationFormatted: '',
        averageRating: 0,
        roomTypeName: '',
        minimumAge:0
      };
  caculateRewardPoint: number = 0;


  toggleVoucherDetail(code: string) {
    this.selectedVoucher = this.selectedVoucher === code ? null : code;
  }

  showVoucherDetail(code: string) {
    this.selectedVoucher = code;
  }
  loadMovieByShowtime(): void {
    const showtimeId = localStorage.getItem('currentShowtimeId'); // Lấy giá trị từ localStorage bên trong phương thức
    if (!showtimeId) {
      console.error('❌ Showtime ID is missing in localStorage');
      return; // Thoát nếu không tìm thấy showtimeId
    }
  
    this.showtimeService.getMovieByShowtime(showtimeId).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.movieByShowtimeData = response.data;
          console.log('✅ Movie Detail:', this.movieByShowtimeData);
          this.cdr.markForCheck(); // Đánh dấu để cập nhật giao diện
        } else {
          console.warn('⚠️ No data returned from API');
        }
      },
      error: (err) => {
        console.error('❌ Error loading movie detail:', err);
      }
    });
  }
  hideVoucherDetail() {
    // Nếu muốn giữ popup khi click, hãy comment dòng nàyD
    this.selectedVoucher = null;
  }

  copyVoucherCode(code: string) {
    navigator.clipboard.writeText(code);
    this.onSuccessNotification('Đã sao chép mã giảm giá!');
  }

  applyVoucher(code: string): void {
    if (!this.userId) {
      this.toastr.warning('Bạn cần đăng nhập để sử dụng voucher!', 'Thông báo');
      return;
    }
    this.userVoucherService.checkVoucherAvailability(code).subscribe({
      next: (response) => {
        console.log('Voucher check response:', response);
        
        if (response.responseCode === 200) {
          const selectedVoucher = this.userVoucher.find(v => v.voucherCode === code);
          console.log('Selected Voucher:', selectedVoucher);
            this.voucherCode = code;
          if (selectedVoucher) {
            switch (selectedVoucher.voucherType) {
              case 1: 
                if (selectedVoucher.discountType === 'PERCENT') {
                  this.onSuccessNotification('Áp dụng giảm giá phần trăm cho vé xem phim!');
                  this.discountAmount = (this.totalTicketPrice * selectedVoucher.discountValue) / 100;
                } else if (selectedVoucher.discountType === 'FIXED') {
                  this.onSuccessNotification('Áp dụng giảm giá cố định cho vé xem phim!');
                  this.discountAmount = selectedVoucher.discountValue;
                }
                break;
              case 2: // All
                if (selectedVoucher.discountType === 'PERCENT') {
                  this.onSuccessNotification('Áp dụng giảm giá phần trăm cho toàn bộ đơn hàng!');
                  this.discountAmount = (this.totalAmount * selectedVoucher.discountValue) / 100;
                } else if (selectedVoucher.discountType === 'FIXED') {
                  this.onSuccessNotification('Áp dụng giảm giá cố định cho toàn bộ đơn hàng!');
                  this.discountAmount = selectedVoucher.discountValue;
                }
                break;
              case 3: 
                if (selectedVoucher.discountType === 'PERCENT') {
                  this.onSuccessNotification('Áp dụng giảm giá phần trăm cho dịch vụ!');
                  this.discountAmount = (this.totalServiceAmount * selectedVoucher.discountValue) / 100;
                } else if (selectedVoucher.discountType === 'FIXED') {
                  this.onSuccessNotification('Áp dụng giảm giá cố định cho dịch vụ!');
                  this.discountAmount = selectedVoucher.discountValue;
                }
                break;
  
              default:
                this.toastr.warning('Loại voucher không hợp lệ!', 'Thông báo');
                return;
            }
            this.updateTotals();
          } else {
            this.toastr.error('Không tìm thấy voucher!', 'Lỗi');
          }
        } else {
          this.toastr.error(response.message || 'Voucher không khả dụng!', 'Lỗi');
        }
      },
      error: (error) => {
        console.error('Error checking voucher:', error);
        this.toastr.error('Có lỗi xảy ra khi kiểm tra voucher!', 'Lỗi');
      }
    });
  }
  
  isTermsAccepted: boolean = false; // Trạng thái checkbox 1
  isAgeConfirmed: boolean = false; 
  constructor(
    private seatService: SeatService,
    private cdr: ChangeDetectorRef,
    private orderService: OrdersService,
    private toastr: ToastrService,
    private router: Router,
    private modalService: ModalService,
    private authServiceService: AuthServiceService,
    private walletService: WalletOnboardService,
    private membershipService: MembershipService,
    private userVoucherService: UserVoucherService,
    private spinner: NgxSpinnerService,
    private notificationService: NotificationService,
    private showtimeService : ShowtimeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }
  ngOnDestroy(): void {
    this.seatService.resetWarning();
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
  }

  ngOnInit(): void {
    this.loadMovieByShowtime();
    this.onCheckMembership();
    this.getPaymentMethod()
    this.fetchUSDCPriceUSD();
    this.fetchUSDCPriceVND();
    console.log('Amount',this.discountAmount)
    this.subscription = this.authServiceService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });
    if (this.isLoggedIn && isPlatformBrowser(this.platformId)) {
      this.email = localStorage.getItem('email') || '';
      this.userId = localStorage.getItem('userId') || null;
      if (this.userId) {
        this.loadUserVouchers();
      }
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
            // this.TimeUp();
            if (count === 0) {
              this.handleTimeout(); 
            }
          }
        }
      },
    });
    this.membershipService.getPointByUser().subscribe({
      next: (res: any) => {
        this.getRewardPoint = res.data;
        this.caculateRewardPoint = 1000 * this.getRewardPoint.pointRate;
        console.log('Reward Point Data:', this.getRewardPoint);
      },
      error: (err) => {
        // console.error('Error fetching points:', err);
      }
    });
    this.loadData();
    this.applyMembershipDiscount()

  }

  /**
   * Tải danh sách voucher của người dùng từ API
   */
  loadUserVouchers(): void {
    if (!this.userId) {
      return;
    }
  
    this.userVoucherService.getUserVouchers().subscribe({
      next: (response) => {
        if (response.responseCode === 200 && response.data) {
          // Ánh xạ dữ liệu từ API vào danh sách voucher
          this.userVoucher = response.data.map((voucher: any) => ({
            id: voucher.id,
            voucherId: voucher.voucherId,
            userId: voucher.userId,
            claimedAt: new Date(voucher.claimedAt).toLocaleString('vi-VN'), // Định dạng ngày nhận
            expiryDate: new Date(voucher.expiryDate).toLocaleString('vi-VN'), // Định dạng ngày hết hạn
            status: voucher.status, // Ensure status remains a number
            quantity: voucher.quantity,
            usedQuantity: voucher.usedQuantity,
            remainingQuantity: voucher.remainingQuantity,
            voucherCode: voucher.voucherCode,
            voucherDescription: voucher.voucherDescription,
            discountType: voucher.discountType,
            discountValue: voucher.discountValue,
            voucherType: voucher.voucherType,
            minOrderValue: voucher.minOrderValue,
   
          }));
  
          console.log('Danh sách voucher đã tải:', this.userVoucher);
        } else {
          console.error('Lỗi khi tải danh sách voucher:', response.message);
          this.toastr.error(response.message || 'Không thể tải danh sách voucher!', 'Lỗi');
        }
      },
      error: (error) => {
        console.error('Lỗi khi gọi API voucher:', error);
        this.toastr.error('Có lỗi xảy ra khi tải danh sách voucher!', 'Lỗi');
      }
    });
  }
  checkMembership: boolean = false;
  onCheckMembership() {
    if (this.checkLogin()) {
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
  isPromotionSelected: boolean = false;
  onPromotionChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.type = isChecked ? 1 : 0; 
    this.applyMembershipDiscount()
  }
   applyDiscount(voucherType: VoucherType): number {
    let discountedAmount = 0;
  
    switch (voucherType) {
      case VoucherType.Ticket:
        console.log('Giảm giá cho vé xem phim');
        break;
      case VoucherType.All:
        console.log('Giảm giá toàn bộ (vé + dịch vụ)');
        break;
      case VoucherType.Service:
        console.log('Giảm giá cho dịch vụ (combo, bắp rang, nước uống, v.v.)');
        break;
      default:
        console.warn('Loại voucher không hợp lệ');
        break;
    }
  
    return discountedAmount;
  }

  clearLocalStorageData(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Xóa dữ liệu liên quan đến ghế
      localStorage.removeItem('selectedSeats');
      localStorage.removeItem('seatData');
      localStorage.removeItem('currentShowtimeId');

      // Xóa dữ liệu liên quan đến dịch vụ
      localStorage.removeItem('selectedServices');
      localStorage.removeItem('serviceData');

      // Xóa dữ liệu liên quan đến đơn hàng
      localStorage.removeItem('orderData');
      localStorage.removeItem('orderDataPayment');

      // Xóa dữ liệu liên quan đến phim và suất chiếu
      localStorage.removeItem('currentMovieInfo');
      localStorage.removeItem('reloadOnce');
    }
  }
  appliedPoints: { points: number; amount: number }[] = []; // Mảng lưu lịch sử các lần áp dụng điểm thưởng

  onApplyPoint(): void {
    const totalAppliedPoints = this.appliedPoints.reduce((total, entry) => total + entry.points, 0);
  
    // Kiểm tra nếu tổng số điểm áp dụng vượt quá số điểm hiện có
    if (totalAppliedPoints + this.rewardPointsInput > this.getRewardPoint.totalPoint) {
      this.toastr.warning('Tổng số điểm áp dụng vượt quá số điểm hiện có!', 'Cảnh báo');
      return;
    }
  
    // Tính số tiền giảm dựa trên số điểm nhập vào
    let discountPointAmount = this.rewardPointsInput * this.getRewardPoint.pointRate;
  
    // Kiểm tra nếu số tiền giảm vượt quá tổng số tiền
    if (discountPointAmount > this.totalAmount) {
      // Điều chỉnh số điểm thưởng để khớp với tổng số tiền
      this.rewardPointsInput = Math.ceil(this.totalAmount / this.getRewardPoint.pointRate);
      discountPointAmount = Math.round(this.rewardPointsInput * this.getRewardPoint.pointRate);
  
      console.log('Điều chỉnh số điểm thưởng:', this.rewardPointsInput);
      console.log('Điều chỉnh số điểm thưởng discountPointAmount:', discountPointAmount);
  
      // Nếu sau khi điều chỉnh số điểm vẫn không hợp lệ, hiển thị cảnh báo
      if (this.rewardPointsInput <= 0 || discountPointAmount > this.totalAmount) {
        this.toastr.warning('Số điểm nhập vào vượt quá tổng số tiền của đơn hàng!', 'Cảnh báo');
        return;
      }
    }
  
    // Làm tròn số tiền giảm để xử lý sai số nhỏ
    discountPointAmount = Math.min(Math.round(discountPointAmount), this.totalAmount);
  
    // Lưu lại số điểm đã áp dụng
    this.appliedPoints.push({ points: this.rewardPointsInput, amount: discountPointAmount });
  
    // Cập nhật số tiền giảm
    this.discountAmount += discountPointAmount;
  
    // Trừ số điểm đã sử dụng từ tổng số điểm hiện có
    this.getRewardPoint.totalPoint -= this.rewardPointsInput;
  
    // Cập nhật tổng số tiền
    this.updateTotals();
  
    // Reset input điểm thưởng
    this.rewardPointsInput = 0;
  
    this.onSuccessNotification('Áp dụng điểm thưởng thành công!');
  }
  useAllPoints(): void {
    // Kiểm tra nếu tổng số tiền đã bằng 0
    if (this.totalAmount <= 0) {
      this.onInfoNotification('Tổng số tiền đã bằng 0, không cần sử dụng thêm điểm thưởng!');
      return;
    }
  
    // Tính số điểm cần thiết để giảm toàn bộ số tiền
    let requiredPoints = this.totalAmount / this.getRewardPoint.pointRate;
  
    // Làm tròn số điểm cần thiết
    requiredPoints = Math.ceil(requiredPoints);
  
    // Giới hạn số điểm cần thiết trong phạm vi số điểm hiện có
    const pointsToUse = Math.min(requiredPoints, this.getRewardPoint.totalPoint);
  
    if (pointsToUse <= 0) {
      this.toastr.warning('Không thể sử dụng điểm thưởng!', 'Cảnh báo');
      return;
    }
  
    // Tính số tiền giảm dựa trên số điểm sử dụng
    let discountPointAmount = pointsToUse * this.getRewardPoint.pointRate;
  
    // Điều chỉnh số tiền giảm để đảm bảo tổng số tiền bằng 0
    if (discountPointAmount > this.totalAmount) {
      discountPointAmount = this.totalAmount;
    }
  
    // Lưu lại số điểm đã áp dụng
    this.appliedPoints.push({ points: pointsToUse, amount: discountPointAmount });
  
    // Cập nhật số tiền giảm
    this.discountAmount += discountPointAmount;
  
    // Trừ số điểm đã sử dụng từ tổng số điểm hiện có
    this.getRewardPoint.totalPoint -= pointsToUse;
  
    // Đặt tổng số tiền về 0
    this.totalAmount = 0;
  
    // Cập nhật hiển thị
    this.updateTotals();
  
    this.onSuccessNotification(`Đã sử dụng ${pointsToUse} điểm thưởng để giảm toàn bộ số tiền!`);
  }
  onCancelPoint(): void {
    if (this.appliedPoints.length > 0) {
      this.appliedPoints.forEach((entry) => {
        this.discountAmount -= entry.amount; 
        this.getRewardPoint.totalPoint += entry.points; 
      });
  
      this.appliedPoints = [];
  
      this.rewardPointsInput = 0;
  
      this.updateTotals();
  
      this.onSuccessNotification('Đã hủy tất cả các lần áp dụng điểm thưởng và hoàn lại số điểm!');
    } else {
      this.onInfoNotification('Không có điểm thưởng nào được áp dụng để hủy!');
    }
  }
  openSignIn() {
    const currentUrl = this.router.url;
    localStorage.setItem('redirectUrl', currentUrl);
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
  onDisconnect() {
    this.seatService.disconnect()
  }
  applyMembershipDiscount(): void {
    if (!this.totalAmount || !this.totalTicketPrice) {
      return;
    }
    this.membershipService.getPriceMembershipPreview(this.totalAmount, this.totalTicketPrice,this.type).subscribe({
      next: (response: any) => {
        if (response.responseCode === 200) {
          const discountData = response.data;
          this.discountAmount = discountData.discountAmount;
          this.pointWillEarn = discountData.pointWillEarn;
          this.freeService = discountData.freeService;
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
    if (isPlatformBrowser(this.platformId)) {
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
    this.notificationService
  .onConfirmNotification('Bạn có chắc chắn muốn tiếp tục?', 'Xác nhận hành động', 'Yes', 'No')
  .then((confirmed) => {
    if (confirmed) {
      if (this.checkLogin() === true) {
        this.userId = localStorage.getItem('userId') || null;
      }
      if (this.totalAmount === 0) {
        this.completeOrderWithoutPayment();
        console.log('Đơn hàng không có phí dịch vụ, không cần thanh toán.');
        return;
      }
      if (!this.selectedPaymentMethod) {
        this.toastr.warning('Vui lòng chọn phương thức thanh toán.');
        return;
      }
      const allSeatIds = this.seats.flatMap(seat => seat.seatIds);
      const orderData: OrderModelReq = {
        type:this.type,
        totalPrice:this.totalAmount,
        email: this.email,
        isAnonymous: 0,
        userId: this.userId,
        transactionCode: '',
        totalDiscount: this.discountAmount,
        pointUse:this.appliedPoints.reduce((total, entry) => total + entry.points, 0),
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
    } else {
      return;
    }
  });
  }
  getPaymentMethod() {
    this.orderService.getPaymentMethod().subscribe({
      next: (res: any) => {
        this.listPaymentMethod = res.data
        console.log(this.listPaymentMethod, 'Payment Method');
      },
      error: (error) => {
        console.error('Error get payment:', error);
      }
    })
  }
  convertVNDToUSDC(vndAmount: number): number | null {
    if (this.usdcPriceUSD && this.usdcPriceVND) {
      const usdcPriceInVND = this.usdcPriceVND;
      const usdcAmount = vndAmount / usdcPriceInVND;
      if (usdcAmount < 0.005) {
        return 0;
      }
      return parseFloat(usdcAmount.toFixed(6));
    }
    return null;
  }
  disconnect(): void {
    this.seatService.disconnect();
    this.seatService.clearConnection()
    this.seatService.clearReCountdown();
  }
  completeOrderWithoutPayment(): void {
    this.spinner.show(); 
    const allSeatIds = this.seats.flatMap(seat => seat.seatIds);
    const orderData: OrderModelReq = {
      type : this.type,
      email: this.email,
      totalPrice:this.totalAmount,
      isAnonymous: 0,
      userId: this.userId,
      totalDiscount: this.discountAmount,
      transactionCode: 'NO_PAYMENT',
      pointUse: this.appliedPoints.reduce((total, entry) => total + entry.points, 0),
      paymentId: null,
      totalPriceMethod: '0',
      voucherCode: this.voucherCode || '',
      services: this.services.map(service => ({
        serviceId: service.id,
        quantity: service.quantity
      })),
      tickets: allSeatIds.map(seatId => ({
        seatByShowTimeId: seatId
      })),
    };
  
    this.orderService.createOrder(orderData).subscribe({
      next: (response: any) => {
        this.onSuccessNotification('Bạn đã đặt vé thành công!');;
        const seatsToUpdate: SeatStatusUpdateRequest[] = orderData.tickets.map((ticket: TicketReq) => ({
          SeatId: ticket.seatByShowTimeId,
          Status: 5
        }));
        this.seatService.payment(seatsToUpdate);
        this.spinner.hide(); 
        this.disconnect()
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error creating order without payment:', error);
        this.toastr.error('❌ Lỗi khi hoàn tất đơn hàng.', 'Thông báo');
        this.spinner.hide(); // Ẩn spinner khi xảy ra lỗi
      }
    });
  }
  onSuccessNotification(message: string): void {
    Swal.fire({
      title: 'Thành công!',
      text: `${message}`,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
      background: '#f9f9f9',
      customClass: {
        popup: 'swal2-popup-custom',
      },
      timer: 3000, 
      timerProgressBar: true, 
    });
  }
  onInfoNotification(message: string): void {
    Swal.fire({
      title: 'Thông báo!',
      text: `${message}`,
      icon: 'info', 
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
      background: '#f9f9f9', 
      customClass: {
        popup: 'swal2-popup-custom',
      },
      timer: 3000, 
      timerProgressBar: true, 
    });
  }
  onErrorNotification(message: string): void {
    Swal.fire({
      title: 'Thất bại!',
      text: `${message}`,
      icon: 'error', 
      confirmButtonText: 'OK',
      confirmButtonColor: '#d33', 
      background: '#f9f9f9',
      customClass: {
        popup: 'swal2-popup-custom',
      },
      timer: 3000, 
      timerProgressBar: true, 
    });
  }
  handleSuccessfulPayment(transactionCode: string, orderData: OrderModelReq) {
    const orderDataString = localStorage.getItem('orderDataPayment');
    if (orderDataString) {
      orderData.transactionCode = transactionCode;
      this.orderService.createOrder(orderData).subscribe({
        next: (response) => {
          if (response.responseCode !== 200) {
           this.onErrorNotification('❌ Đơn hàng không thành công: ' + response.Message);
            return;
          }
  
          const seatsToUpdate: SeatStatusUpdateRequest[] = orderData.tickets.map((ticket: TicketReq) => ({
            SeatId: ticket.seatByShowTimeId,
            Status: 5
          }));
  
          this.seatService.payment(seatsToUpdate);
          console.log(seatsToUpdate,'tseatsToUpdate');
          this.onSuccessNotification('Đơn hàng đã được tạo thành công!');
          this.disconnect()
          localStorage.removeItem('selectedSeats');
          localStorage.removeItem('orderData');
          localStorage.removeItem('orderDataPayment');
          this.router.navigate(['/']);
        },
        error: (error) => {
          const seatsToUpdate: SeatStatusUpdateRequest[] = orderData.tickets.map((ticket: TicketReq) => ({
            SeatId: ticket.seatByShowTimeId,
            Status: 5
          }));
  
          this.seatService.payment(seatsToUpdate);
          console.error('Error creating order:', error);
          this.onErrorNotification('❌ Lỗi khi tạo đơn hàng');
        }
      });
    }
  }
  handleTimeout(): void {
    if (this.selectedPaymentMethod === 'VNPAY') {
      const callbackWindow = window.open('', '_blank');
      if (callbackWindow) {
        callbackWindow.close();
      }
    }
    if (this.selectedPaymentMethod === 'MULTI-WALLET') {
      this.onErrorNotification('Thời gian thanh toán đã hết. Giao dịch của bạn đã bị hủy.');
      this.walletAddress = null;
      this.roundedUSDCAmount = 0;
    }
    this.clearLocalStorageData();
  
    this.onErrorNotification('Thời gian thanh toán đã hết. Đơn hàng của bạn đã bị hủy.');
    this.spinner.hide();
    this.appliedPoints = [];
    this.discountAmount = 0;
    this.rewardPointsInput = 0;
    this.updateTotals();
  
    this.router.navigate(['/']);
  }
  confirmDisconnect(event: Event): void {
    event.preventDefault(); // Ngăn chặn hành động mặc định của thẻ <a>
  
    Swal.fire({
      title: 'Xác nhận thoát',
      text: 'Bạn có chắc chắn muốn thoát không? Mọi thay đổi sẽ không được lưu.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Có',
      cancelButtonText: 'Không',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result: SweetAlertResult<any>) => {
      if (result.isConfirmed) {
        this.disconnect(); 
        this.router.navigate(['/']);
      }
    });
  }
  createPayment(paymentData: PaymentModelReq, orderData: OrderModelReq) {
    if (this.selectedPaymentMethod === 'VNPAY') {
    this.spinner.show();
      this.orderService.createPayment(paymentData).subscribe({
        next: (response: any) => {
          if (response.responseCode === 1) {
            localStorage.setItem('orderDataPayment', JSON.stringify(orderData));
            const callbackWindow = window.open(response.data, '_blank');
            let paymentSuccess = false; // Biến để theo dõi trạng thái thanh toán
      
            // Lắng nghe sự kiện message từ cửa sổ thanh toán
            const messageListener = (event: MessageEvent) => {
              if (!event.data || !event.data.type) return;
      
              if (event.data.type === 'PAYMENT_SUCCESS') {
                paymentSuccess = true; // Đánh dấu thanh toán thành công
                this.handleSuccessfulPayment(event.data.transactionCode, orderData);
                this.onSuccessNotification('✅ Thanh toán thành công!');
              } else if (event.data.type === 'PAYMENT_FAILED') {
                this.onErrorNotification('❌ Thanh toán thất bại.');
              }
      
              // Đóng cửa sổ thanh toán và xóa listener
              if (callbackWindow) {
                callbackWindow.close();
              }
              window.removeEventListener('message', messageListener);
      
              // Ẩn spinner sau khi xử lý xong
              this.spinner.hide();
            };
      
            window.addEventListener('message', messageListener);
      
            // Kiểm tra trạng thái của cửa sổ thanh toán
            const checkWindowClosed = setInterval(() => {
              if (callbackWindow && callbackWindow.closed) {
                clearInterval(checkWindowClosed); // Dừng kiểm tra
                if (!paymentSuccess) {
                  this.onErrorNotification('❌ Thanh toán thất bại do cửa sổ bị đóng.');
                  this.spinner.hide();
                }
              }
            }, 500); // Kiểm tra mỗi 500ms
          } else {
            this.onErrorNotification('❌ Lỗi khi tạo thanh toán:');
            this.spinner.hide(); 
          }
        },
        error: (error) => {
          console.error('Error creating payment:', error);
          this.onErrorNotification('❌ Lỗi khi tạo thanh toán:');
          this.spinner.hide(); // Ẩn spinner khi lỗi xảy ra
        }
      });
    } else if (this.selectedPaymentMethod === 'MULTI-WALLET') {
      this.walletService.connectWallet()
        .then((walletAddress) => {
          if (!walletAddress) {
            this.onErrorNotification('Failed to connect wallet.');
            this.spinner.hide(); // Ẩn spinner khi lỗi xảy ra
            return;
          }
          this.walletAddress = walletAddress;
          this.spinner.show();
          if (this.countdown === '0:00') {
            this.onErrorNotification('Thời gian thanh toán đã hết. Giao dịch bị hủy.');
            this.spinner.hide();
            return;
          }
          // Chuyển đổi từ VND sang USDC
          const usdcAmount = this.convertVNDToUSDC(this.totalAmount);
          if (usdcAmount === null) {
           this.onErrorNotification('Không thể chuyển đổi VND sang USDC. Vui lòng thử lại.');
            this.spinner.hide(); // Ẩn spinner khi lỗi xảy ra
            return;
          }
  
          this.roundedUSDCAmount = parseFloat(usdcAmount.toFixed(6));
          if (isNaN(this.roundedUSDCAmount) || this.roundedUSDCAmount <= 0) {
            this.onErrorNotification('Invalid USDC amount. Please try again.');
            this.spinner.hide(); // Ẩn spinner khi lỗi xảy ra
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
            this.onErrorNotification('Invalid transaction hash. Please try again.');
            this.spinner.hide(); 
            return;
          }
  
          this.orderService.createOrder(orderData).subscribe({
            next: (response: any) => {
              if (response.responseCode != 200) {
                this.onErrorNotification('❌ Đơn hàng không thành công:' + response.Message);
                this.spinner.hide();
                return;
              }
  
              const seatsToUpdate: SeatStatusUpdateRequest[] = orderData.tickets.map((ticket: TicketReq) => ({
                SeatId: ticket.seatByShowTimeId,
                Status: 5
              }));
              this.seatService.payment(seatsToUpdate);
              this.onSuccessNotification('Đơn hàng đã được tạo thành công!');
              this.spinner.hide(); // Ẩn spinner khi thành công
              this.disconnect()
              this.router.navigate(['/']);
            },
            error: (error) => {
              console.error('Error creating order:', error);
              this.onErrorNotification('❌ Lỗi khi tạo đơn hàng.');
              this.spinner.hide(); // Ẩn spinner khi lỗi xảy ra
            }
          });
        })
        .catch((error) => {
          console.error('Error during wallet payment:', error);
          this.onErrorNotification('An error occurred during the payment process. Please try again.');
          this.spinner.hide(); // Ẩn spinner khi lỗi xảy ra
        });
    }
  }
  updateTotals(): void {
    // Tính tổng tiền vé
    this.totalTicketPrice = this.seats.reduce((total, seat) => total + seat.total, 0);

    // Tính tổng tiền dịch vụ
    this.totalServiceAmount = this.services.reduce((total, service) => total + (service.price * service.quantity), 0);

    // Tính tổng tiền cuối cùng
    this.totalAmount = this.totalTicketPrice + this.totalServiceAmount - this.discountAmount - this.discountPointAmount;

    // Đảm bảo tổng số tiền không âm
    if (this.totalAmount < 0) {
      this.totalAmount = 0;
    }

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
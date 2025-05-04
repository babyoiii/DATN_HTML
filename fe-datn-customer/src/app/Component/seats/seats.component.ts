import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, Location, isPlatformBrowser } from '@angular/common';
import { DurationFormatPipe } from '../../duration-format.pipe';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SeatService } from '../../Service/seat.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { SeatInfo } from '../../Models/SeatModel';
import { GroupByPipe } from '../../GroupByPipe.pipe';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { DialogData, NotificationDialogComponent } from '../notification-dialog/notification-dialog.component';
import { SeatDataService } from '../../Service/SeatData.service';
import { ModalService } from '../../Service/modal.service';
import { ShowtimeService } from '../../Service/showtime.service';
import { MovieByShowtimeData } from '../../Models/MovieModel';
import { AuthServiceService } from '../../Service/auth-service.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { NeedMoreTimeComponent } from "../need-more-time/need-more-time.component";
import { TimeUpComponent } from "../time-up/time-up.component";
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from '../../Service/notification.service';
import Swal, { SweetAlertResult } from 'sweetalert2';

enum SeatStatus {
  Available = 0,
  Selected = 1,
  Booked = 5,
  Unavailable = 3,
  Busy = 4
}

interface SeatStatusUpdateRequest {
  SeatId: string;
  Status: SeatStatus;
}

@Component({
  selector: 'app-seats',
  standalone: true,
  imports: [CommonModule, GroupByPipe,NgxSpinnerModule],
  templateUrl: './seats.component.html',
  styleUrls: ['./seats.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  seats: SeatInfo[] = [];
  seatsCore: SeatInfo[] = [];
  selectedSeats: SeatInfo[] = [];
  totalAmount = 0;
  isLoading = true;
  error: string | null = null;
  Rows: string[] = [];
  seatsPerRow: Record<string, SeatInfo[]> = {};
  countdown: string | null = null;
  isPanelCollapsed = false;
  isLoggedIn: boolean = false;
  movieInfo: any = null;
  private subscription!: Subscription;
  @ViewChild('seatMapContainer') seatMapContainer!: ElementRef;
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
  currentZoom: number = 1;
  minZoom: number = 0.6;
  maxZoom: number = 2.0;
  zoomStep: number = 0.1;
  isDragging: boolean = false;
  startX: number = 0;
  startY: number = 0;
  translateX: number = 0;
  translateY: number = 0;
  private eventListeners: (() => void)[] = [];
  private autoCloseTimer: any;
  movieDetail: MovieByShowtimeData | null = null;
  constructor(
    private seatService: SeatService,
    private seatDataService: SeatDataService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private location: Location,
    private modalService: ModalService,
    private showtimeService: ShowtimeService,
    private authServiceService: AuthServiceService,
    private spinner: NgxSpinnerService,
    private notificationService : NotificationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }


  ngOnInit(): void {
    this.subscription = this.authServiceService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      console.log('Login status from BehaviorSubject:', status);
    });
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const showtimeId = params['id'];
        this.loadSeatsByShowtimeId(showtimeId)
        this.loadMovieByShowtime(showtimeId);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentShowtimeId', showtimeId);
        }
        const userId = this.ensureUserId();
        console.log(userId);

        if (showtimeId) {
          const navigation = this.router.getCurrentNavigation();
          if (navigation?.extras.state) {
            const state = navigation.extras.state as { seats: SeatInfo[], selectedSeats: SeatInfo[], totalAmount: number };
            this.seats = state.seats;
            this.selectedSeats = state.selectedSeats;
            this.totalAmount = state.totalAmount;
            this.isLoading = false;
            this.cdr.markForCheck();
          } else {
            this.loadSeats(showtimeId, userId);
          }
        }
      });

    if (isPlatformBrowser(this.platformId)) {
      const shouldReload = sessionStorage.getItem('reloadOnce');
      if (shouldReload) {
        sessionStorage.removeItem('reloadOnce');
        this.reloadCurrentRoute();
      }
    }

    this.seatDataService.seats$.pipe(takeUntil(this.destroy$)).subscribe(seats => {
      this.seats = seats;
      this.cdr.markForCheck();
    });

    this.seatDataService.selectedSeats$.pipe(takeUntil(this.destroy$)).subscribe(selectedSeats => {
      this.selectedSeats = selectedSeats;
      this.cdr.markForCheck();
    });
    this.seatDataService.seatCore$.pipe(takeUntil(this.destroy$)).subscribe(seatCore => {
      this.seatsCore = seatCore;
      this.cdr.markForCheck();
    });

    this.seatDataService.totalAmount$.pipe(takeUntil(this.destroy$)).subscribe(totalAmount => {
      this.totalAmount = totalAmount;
      this.cdr.markForCheck();
    });






    if (isPlatformBrowser(this.platformId)) {
      const movieInfoStr = localStorage.getItem('currentMovieInfo');
      if (movieInfoStr) {
        this.movieInfo = JSON.parse(movieInfoStr);
      }
    }

    console.log("Dữ liệu phim:", this.movieInfo)

  
  }

  private reloadCurrentRoute(): void {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  // onExtendCountdown(): void {
  //   const extensionDuration = 30;
  //   this.seatService.extendCountdown(extensionDuration);
  // }
  onExtendCountdown(): void {
    this.modalService.openNeedMoreTimeModal();
    console.log("đã gọi");

  }
  loadMovieByShowtime(showtimeId: string): void {
    this.showtimeService.getMovieByShowtime(showtimeId).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.movieByShowtimeData = response.data; 
          console.log('✅ Movie Detail:123', this.movieByShowtimeData);
          this.cdr.markForCheck(); 
        }
      },
      error: (err) => {
        console.error('❌ Error loading movie detail:', err);
      }
    });
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
  TimeUp(): void {
    this.modalService.openTimeUpModal();

  }

  AddMoreTime(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
    this.modalService.openNeedMoreTimeModal();
  }

  openSignIn() {
    const currentUrl = this.router.url;
      localStorage.setItem('redirectUrl', currentUrl);
  }
  private loadSeats(showtimeId: string, userId: string): void {
    this.spinner.show(); // Hiển thị spinner khi bắt đầu tải ghế

    this.seats = [];
    this.selectedSeats = [];
    this.totalAmount = 0;
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    let selectedSeats: any[] = [];
    if (isPlatformBrowser(this.platformId)) {
      const selectedSeatsStr = localStorage.getItem('selectedSeats');
      selectedSeats = selectedSeatsStr ? JSON.parse(selectedSeatsStr) : [];
    }

    this.initializeWebSocket(showtimeId, userId);

    this.selectedSeats = selectedSeats;
  this.spinner.hide();
  
  }

  private initializeWebSocket(showtimeId: string, userId: string): void {
    this.seatService.connect(showtimeId, userId);

    this.seatService.getMessages()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.handleSeatError(error);
          throw error;
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (data: SeatInfo[]) => {
          this.processSeatData(data);
          this.calculateTotal();
        }
      });

    this.seatService.getJoinRoomMessages()
      .pipe()
      .subscribe({
        next: (count: number | null) => {
          if (count !== null && count > 0) {
            this.handleCountdown(count);
          }
        },
        error: (error) => this.handleCountdownError(error)
      });
  }
  checkLogin(): boolean {
    return this.authServiceService.isLoggedIn();
  }
  private processSeatData(data: SeatInfo[]): void {

    this.seatsCore = [...data].flat();
    this.seatDataService.setSeatCore(this.seatsCore);
    this.seats = this.filterAndSortSeats(this.seatsCore);
    this.selectedSeats = this.seats.filter(seat => seat.Status === SeatStatus.Selected);
    this.groupSeatsByRow();
    this.calculateTotal();
    this.cdr.markForCheck();

    // Save seat data to the service
    this.seatDataService.setSeats(this.seats);
    this.seatDataService.setSelectedSeats(this.selectedSeats);
    this.seatDataService.setTotalAmount(this.totalAmount);
  }
  loadSeatsByShowtimeId(showtimeId: string): void {
    this.showtimeService.getMovieByShowtime(showtimeId).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.movieDetail = response.data;
          console.log('✅ Movie Detail:', this.movieDetail);
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('❌ Error loading movie detail:', err);
      }
    });
  }


  private handleSeatError(error: any): void {
    console.error('Error receiving seats:', error);
    this.error = 'Error loading seat data';
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  private handleCountdown(count: number): void {
    const minutes = Math.floor(count / 60);
    const seconds = count % 60;
    this.countdown = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    this.cdr.markForCheck();

    if (count === 60 && !this.seatService.hasShownWarning()) {
      this.seatService.setWarningShown();
      this.AddMoreTime();
      this.autoCloseTimer = setTimeout(() => {
        this.modalService.closeNeedMoreTimeModal();
      }, 5000);
    }
    if (count === 1) {
      this.handleTimeout();
    }
  }
  handleTimeout(): void {
    this.clearLocalStorageData();
    this.notificationService.onErrorNotification('Thời gian thanh toán đã hết. Đơn hàng của bạn đã bị hủy.');
    this.router.navigate(['/']);
  }
  private handleCountdownError(error: any): void {
    console.error('Lỗi khi nhận countdown:', error);
  }

  private ensureUserId(): string {
    if (isPlatformBrowser(this.platformId)) {
      let userId = localStorage.getItem('userId');

      if (!userId) {
        userId = this.generateUserId();
        localStorage.setItem('userId', userId);
      }
      return userId;
    }
    return this.generateUserId();
  }

  private generateUserId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  ngOnDestroy(): void {
    // this.destroy$.next();
    // this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.seatService.resetWarning();
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
    // Dọn dẹp tất cả event listeners
    this.eventListeners.forEach(cleanupFn => cleanupFn());
    this.eventListeners = [];
  }

  toggleSeatStatus(seat: SeatInfo): void {
    if (seat.Status !== SeatStatus.Available && seat.Status !== SeatStatus.Selected) {
      return;
    }

    const updateRequests: SeatStatusUpdateRequest[] = [];
    const newStatus = seat.Status === SeatStatus.Available
      ? SeatStatus.Selected
      : SeatStatus.Available;

    if (newStatus === SeatStatus.Selected) {
      const pairedSeat = this.findPairedSeat(seat);

      const totalSelectedSeats = this.selectedSeats.reduce((count, s) => {
        return count + (s.PairId ? 2 : 1);
      }, 0);

      const seatsToAdd = pairedSeat ? 2 : 1;
      if (totalSelectedSeats + seatsToAdd > 8) {
        this.notificationService.onWarningNotification('Bạn chỉ được chọn tối đa 8 ghế!');
        return;
      }
    }

    const seatsToUpdate = [seat];
    const pairedSeat = this.findPairedSeat(seat);
    if (pairedSeat) {
      seatsToUpdate.push(pairedSeat);
    }

    seatsToUpdate.forEach(s => {
      s.Status = newStatus;
      updateRequests.push({
        SeatId: s.SeatStatusByShowTimeId,
        Status: newStatus
      });
    });

    this.selectedSeats = this.seats.filter(s => s.Status === SeatStatus.Selected);
    this.calculateTotal();

    if (updateRequests.length > 0) {
      this.seatService.updateStatus(updateRequests);
    }

    this.cdr.markForCheck();
  }

  calculateTotal(): void {
    this.totalAmount = this.selectedSeats.reduce((sum, seat) => {
      const pairedSeat = this.findPairedSeat(seat);
      if (pairedSeat && seat.PairId) {
        return sum + seat.SeatPrice + pairedSeat.SeatPrice;
      }
      return sum + seat.SeatPrice;
    }, 0);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  findPairedSeat(seat: SeatInfo): SeatInfo | null {
    if (!seat.PairId) return null;
    return this.seatsCore.find(s => s.SeatId === seat.PairId) || null;
  }

  getSeatFillClass(seat: SeatInfo): string {
    switch (seat.Status) {
      case SeatStatus.Available:
        return '';
      case SeatStatus.Selected:
        return 'fill-red-500';
      case SeatStatus.Booked:
        return 'fill-gray-200';
      case SeatStatus.Busy:
        return 'fill-yellow-500'; 
      case SeatStatus.Unavailable:
        return 'cursor-not-allowed invisible';
      default:
        console.warn(`Unexpected seat status: ${seat.Status}`);
        return '';
    }
  }
  private notifyAndRedirect(): void {
    this.toastr.warning('Thời gian giữ ghế đã hết, bạn sẽ được chuyển hướng.', 'Cảnh báo');
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 3000);
  }
  getSeatNameByPairId(pairId: string): string | undefined {
    var result = this.seatsCore.find(seat => seat.SeatId === pairId)?.SeatName;
    return result;
  }

  getRowLabel(rowNumber: number): string {
    return String.fromCharCode(64 + rowNumber);
  }

  private filterAndSortSeats(seats: SeatInfo[]): SeatInfo[] {
    const displayedSeats = new Set<string>();

    const sortedSeats = seats.sort((a, b) => {
      if (a.RowNumber === b.RowNumber) {
        return a.ColNumber - b.ColNumber;
      }
      return a.RowNumber - b.RowNumber;
    });

    return sortedSeats.filter(seat => {
      if (!seat.PairId) {
        return true;
      }

      const seatPairKey = [seat.SeatId, seat.PairId].sort().join('-');
      if (displayedSeats.has(seatPairKey)) {
        return false;
      }

      displayedSeats.add(seatPairKey);
      return true;
    });
  }

  // Phương thức tìm các ghế lẻ trong một hàng
  findIsolatedSeatsInRow(seats: SeatInfo[]): SeatInfo[] {
    // Nếu không có ghế nào đang chọn thì không có ghế lẻ
    const hasSelected = seats.some(s => s.Status === SeatStatus.Selected);
    if (!hasSelected) return [];

    // occupancy: 1 = Selected/Booked, 0 = Available
    const occupancy = seats.map(s =>
      (s.Status === SeatStatus.Selected || s.Status === SeatStatus.Booked) ? 1 : 0
    );

    const total = seats.length;
    const isolatedSeats: SeatInfo[] = [];

    for (let i = 0; i < total; i++) {
      // chỉ quan tâm ghế trống
      if (occupancy[i] === 0) {
        // kiểm tra bên trái
        const leftIsEdge = i === 0;
        const leftOccupied = leftIsEdge
          // nếu là lối đi, bạn có thể cho phép (thì đổi true thành false)
          ? true
          : occupancy[i - 1] === 1;

        // kiểm tra bên phải
        const rightIsEdge = i === total - 1;
        const rightOccupied = rightIsEdge
          // nếu là lối đi, bạn có thể cho phép (thì đổi true thành false)
          ? true
          : occupancy[i + 1] === 1;

        // nếu hai bên đều occupied → có nguy cơ ghế lẻ
        if (leftOccupied && rightOccupied) {
          // ngoại lệ: ghế này có ghế "đối ứng" (paired seat) cũng đang Selected → cho phép
          const seat = seats[i];
          const paired = this.findPairedSeat(seat);
          const pairedIsSelected = paired?.Status === SeatStatus.Selected;

          if (!pairedIsSelected) {
            isolatedSeats.push(seat);
          }
        }
      }
    }

    return isolatedSeats;
  }

  validateRowSeats(seats: SeatInfo[]): boolean {
    // Nếu không có ghế nào đang chọn thì ok luôn
    const hasSelected = seats.some(s => s.Status === SeatStatus.Selected);
    if (!hasSelected) return true;

    // occupancy: 1 = Selected/Booked, 0 = Available
    const occupancy = seats.map(s =>
      (s.Status === SeatStatus.Selected || s.Status === SeatStatus.Booked) ? 1 : 0
    );

    const total = seats.length;

    for (let i = 0; i < total; i++) {
      // chỉ quan tâm ghế trống
      if (occupancy[i] === 0) {
        // kiểm tra bên trái
        const leftIsEdge = i === 0;
        const leftOccupied = leftIsEdge
          // nếu là lối đi, bạn có thể cho phép (thì đổi true thành false)
          ? true
          : occupancy[i - 1] === 1;

        // kiểm tra bên phải
        const rightIsEdge = i === total - 1;
        const rightOccupied = rightIsEdge
          // nếu là lối đi, bạn có thể cho phép (thì đổi true thành false)
          ? true
          : occupancy[i + 1] === 1;

        // nếu hai bên đều occupied → có nguy cơ ghế lẻ
        if (leftOccupied && rightOccupied) {
          // ngoại lệ: ghế này có ghế “đối ứng” (paired seat) cũng đang Selected → cho phép
          const seat = seats[i];
          const paired = this.findPairedSeat(seat);
          const pairedIsSelected = paired?.Status === SeatStatus.Selected;

          if (!pairedIsSelected) {
            const rowLabel = this.getRowLabel(seat.RowNumber);
            const col = seat.ColNumber;
            this.toastr.error(
              `Không thể để lẻ ghế ở hàng ${rowLabel} số ${col}`,
              'Lỗi chọn ghế'
            );
            return false;
          }
        }
      }
    }

    return true;
  }

  showNotification(type: 'success' | 'error' | 'warning', message: string): void {
    const dialogData: DialogData = { type, message };
    this.dialog.open(NotificationDialogComponent, {
      data: dialogData
    });
  }

  validateSeats(): boolean {
    if (this.selectedSeats.length === 0) {
      this.notificationService.onWarningNotification('Vui lòng chọn ít nhất một ghế!');
      return false;
    }
  
    if (this.selectedSeats.length === 1) {
      return true;
    }
  
    const allIsolatedSeats: SeatInfo[] = [];
  
    // Nhóm ghế theo hàng
    const groupedSeats = this.groupSeatsByRow();
  
    // Kiểm tra từng hàng
    for (const rowNumber in groupedSeats) {
      const rowSeats = groupedSeats[rowNumber];
      const isolatedSeatsInRow = this.findIsolatedSeatsInRow(rowSeats);
      allIsolatedSeats.push(...isolatedSeatsInRow);
    }
  
    // Lọc bỏ các ghế lẻ thuộc ghế đôi mà ghế đối ứng không được chọn
    const filteredIsolatedSeats = allIsolatedSeats.filter(seat => {
      const pairedSeat = this.findPairedSeat(seat);
  
      // Nếu ghế lẻ thuộc ghế đôi và ghế đối ứng không được chọn, bỏ qua
      if (pairedSeat && pairedSeat.PairId && pairedSeat.Status !== SeatStatus.Selected) {
        return false;
      }
  
      return !(pairedSeat && pairedSeat.Status === SeatStatus.Selected);
    });
  
    // Nếu vẫn còn ghế lẻ, hiển thị thông báo lỗi
    if (filteredIsolatedSeats.length > 0) {
      // Nhóm các ghế lẻ theo hàng để hiển thị thông báo gọn hơn
      const isolatedByRow: { [key: string]: string[] } = {};
  
      filteredIsolatedSeats.forEach(seat => {
        const rowLabel = this.getRowLabel(seat.RowNumber);
        if (!isolatedByRow[rowLabel]) {
          isolatedByRow[rowLabel] = [];
        }
        isolatedByRow[rowLabel].push(seat.ColNumber.toString());
      });
  
      // Tạo thông báo lỗi
      let errorMessage = 'Không thể để lẻ ghế ở các vị trí sau: ';
  
      // Tạo danh sách các hàng ghế có vấn đề
      const rowEntries = Object.entries(isolatedByRow);
  
      // Sắp xếp các hàng theo thứ tự alphabet
      rowEntries.sort((a, b) => a[0].localeCompare(b[0]));
  
      // Tạo HTML cho thông báo
      rowEntries.forEach(([rowLabel, seatNumbers], index) => {
        // Sắp xếp số ghế theo thứ tự tăng dần
        const sortedSeatNumbers = [...seatNumbers].sort((a, b) => parseInt(a) - parseInt(b));
  
        // Thêm mỗi hàng vào một dòng riêng
        errorMessage += `Hàng ${rowLabel} : ghế ${sortedSeatNumbers.join(', ')}`;
  
        // Thêm dấu xuống dòng nếu không phải dòng cuối cùng
        if (index < rowEntries.length - 1) {
          errorMessage += '';
        }
      });
  
      // Sử dụng enableHtml: true để hiển thị HTML trong toast
      this.notificationService.onErrorNotification(errorMessage);
      return false;
    }
  
    return true;
  }

  onContinue(): void {
    if (this.validateSeats()) {
      const selectedSeatsInfo = this.selectedSeats.flatMap(seat => {
        const pairedSeat = this.findPairedSeat(seat);

        if (!seat.SeatStatusByShowTimeId) {
          return [];
        }

        if (pairedSeat && seat.PairId) {
          const isPairedAlreadyAdded = this.selectedSeats.some(
            (s) => s.SeatId === pairedSeat.SeatId
          );

          if (!isPairedAlreadyAdded && pairedSeat.SeatStatusByShowTimeId) {
            return [
              {
                seatId: seat.SeatStatusByShowTimeId,
                seatName: seat.SeatName,
                price: seat.SeatPrice,
                SeatTypeName: seat.SeatTypeName
              },
              {
                seatId: pairedSeat.SeatStatusByShowTimeId,
                seatName: pairedSeat.SeatName,
                price: pairedSeat.SeatPrice,
                SeatTypeName: pairedSeat.SeatTypeName
              }
            ];
          }
        }

        return {
          seatId: seat.SeatStatusByShowTimeId,
          seatName: seat.SeatName,
          price: seat.SeatPrice,
          SeatTypeName: seat.SeatTypeName
        };
      });

      localStorage.setItem('selectedSeats', JSON.stringify(selectedSeatsInfo));
      this.router.navigate(['/orders'], { state: { seats: this.seats, selectedSeats: this.selectedSeats, totalAmount: this.totalAmount } });
    }
  }

  getMaxSeatsPerRow(): number {
    if (!this.seats) return 12; // Default fallback

    let maxCount = 0;
    const groupedSeats = this.groupSeatsByRow();

    Object.values(groupedSeats).forEach(row => {
      if (row.length > maxCount) {
        maxCount = row.length;
      }
    });

    return maxCount;
  }

  // Helper method to group seats by row
  private groupSeatsByRow(): { [key: string]: any[] } {
    const result: { [key: string]: any[] } = {};

    if (this.seats) {
      this.seats.forEach(seat => {
        const rowNumber = seat.RowNumber;
        if (!result[rowNumber]) {
          result[rowNumber] = [];
        }
        result[rowNumber].push(seat);
      });
    }

    return result;
  }










































  toggleInfoPanel() {
    this.isPanelCollapsed = !this.isPanelCollapsed;
  }






  // Thay thế các phương thức từ dòng 546 đến dòng 615 với mã tối ưu hơn
  // Zoom in
  zoomIn(): void {
    if (this.currentZoom < this.maxZoom) {
      this.currentZoom += this.zoomStep;
      this.applyTransform();
    }
  }

  // Zoom out
  zoomOut(): void {
    if (this.currentZoom > this.minZoom) {
      this.currentZoom -= this.zoomStep;
      this.applyTransform();

      // Reset vị trí nếu zoom quá nhỏ
      if (this.currentZoom <= 1) {
        this.resetPosition();
      }
    }
  }

  // Reset vị trí về trung tâm
  resetPosition(): void {
    this.translateX = 0;
    this.translateY = 0;
    this.applyTransform();
  }

  // Áp dụng phép biến đổi cho sơ đồ ghế
  applyTransform(): void {
    const seatMap = document.querySelector('.seat-map-content') as HTMLElement;
    if (seatMap) {
      seatMap.style.transform = `scale(${this.currentZoom}) translate(${this.translateX}px, ${this.translateY}px)`;
    }
  }

  // Bắt đầu kéo sơ đồ
  startDrag(event: Event): void {
    const mouseEvent = event as MouseEvent;
    if (this.currentZoom > 1) {
      this.isDragging = true;
      this.startX = mouseEvent.clientX;
      this.startY = mouseEvent.clientY;
    }
  }

  // Kéo sơ đồ
  drag(event: Event): void {
    const mouseEvent = event as MouseEvent;
    if (!this.isDragging || this.currentZoom <= 1) return;

    const deltaX = (mouseEvent.clientX - this.startX) / this.currentZoom;
    const deltaY = (mouseEvent.clientY - this.startY) / this.currentZoom;
    this.translateX += deltaX;
    this.translateY += deltaY;
    this.startX = mouseEvent.clientX;
    this.startY = mouseEvent.clientY;
    this.applyTransform();
  }

  // Kết thúc kéo
  endDrag(): void {
    this.isDragging = false;
  }

  // Xử lý sự kiện cuộn chuột
  handleWheel(event: Event): void {
    const wheelEvent = event as WheelEvent;
    wheelEvent.preventDefault();
    if (wheelEvent.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  }

  goBack(event: Event): void {
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.location.back(); // Quay lại trang trước đó
        this.disconnect(); // Gọi hàm disconnect nếu người dùng xác nhận
      }
    });
  }
  disconnect(): void {
    this.seatService.disconnect();
    this.seatService.clearConnection()
    this.seatService.clearReCountdown()
  }
  // Thay thế phương thức ngAfterViewInit
  ngAfterViewInit(): void {
    if (this.seatMapContainer?.nativeElement) {
      const element = this.seatMapContainer.nativeElement;

      // Thêm các sự kiện cho tính năng zoom và drag
      this.addEventListenerWithCleanup(element, 'wheel', this.handleWheel.bind(this), { passive: false });
      this.addEventListenerWithCleanup(element, 'mousedown', this.startDrag.bind(this));
      this.addEventListenerWithCleanup(element, 'mousemove', this.drag.bind(this));
      this.addEventListenerWithCleanup(element, 'mouseup', this.endDrag.bind(this));
      this.addEventListenerWithCleanup(element, 'mouseleave', this.endDrag.bind(this));

      // Thêm hỗ trợ cho thiết bị di động
      // this.addEventListenerWithCleanup(element, 'touchstart', this.handleTouchStart.bind(this));
      // this.addEventListenerWithCleanup(element, 'touchmove', this.handleTouchMove.bind(this));
      this.addEventListenerWithCleanup(element, 'touchend', this.endDrag.bind(this));
    }
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
  // Giữ nguyên phương thức này
  private addEventListenerWithCleanup(
    element: HTMLElement,
    eventName: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void {
    element.addEventListener(eventName, handler, options);
    this.eventListeners.push(() => {
      element.removeEventListener(eventName, handler, options);
    });
  }






  openloginform() {
      const currentUrl = this.router.url;
      localStorage.setItem('redirectUrl', currentUrl);
      this.modalService.openSignInModal();
  }

  /**
   * Tính toán style cho seat map dựa trên số lượng hàng và cột
   * Giúp responsive với các cấu hình rạp khác nhau
   */
  getSeatMapStyle(): { [key: string]: string } {
    // Lấy số lượng hàng và cột tối đa
    const rowCount = this.getRowCount();
    const maxColCount = this.getMaxColCount();

    // Tính toán kích thước phù hợp dựa trên số lượng cột
    let minWidth = '600px';

    // Điều chỉnh kích thước dựa trên số lượng cột
    if (maxColCount > 8) {
      minWidth = '800px';
    }
    if (maxColCount > 12) {
      minWidth = '1000px';
    }

    // Điều chỉnh thêm dựa trên số lượng hàng
    if (rowCount <= 5) {
      // Giảm kích thước nếu ít hàng
      minWidth = parseInt(minWidth) * 0.8 + 'px';
    }

    return {
      'min-width': minWidth,
      'margin': '0 auto',
      'display': 'flex',
      'flex-direction': 'column',
      'align-items': 'center',
      'justify-content': 'center'
    };
  }

  /**
   * Xác định class CSS dựa trên kích thước rạp
   * Giúp áp dụng các style khác nhau cho từng loại rạp
   */
  getTheaterSizeClass(): string {
    const rowCount = this.getRowCount();

    if (rowCount <= 5) {
      return 'small-theater';
    } else if (rowCount <= 8) {
      return 'medium-theater';
    } else {
      return 'large-theater';
    }
  }

  /**
   * Tạo style cho mỗi hàng ghế dựa trên số lượng ghế trong hàng
   * Giúp căn giữa các hàng ghế có số lượng ghế khác nhau
   */
  getRowStyle(seatCount: number): { [key: string]: string } {
    const maxColCount = this.getMaxColCount();

    // Tính toán độ rộng phù hợp cho hàng ghế
    // Nếu số ghế trong hàng ít hơn số cột tối đa, căn giữa hàng
    if (seatCount < maxColCount) {
      // Tính toán độ rộng tương đối dựa trên số ghế
      const widthPercentage = (seatCount / maxColCount) * 100;

      return {
        'width': `${widthPercentage}%`,
        'margin': '0 auto',
        'justify-content': 'center'
      };
    }

    // Nếu số ghế bằng số cột tối đa, sử dụng toàn bộ độ rộng
    return {
      'width': '100%',
      'justify-content': 'center'
    };
  }

  /**
   * Lấy số lượng hàng ghế
   */
  getRowCount(): number {
    if (!this.seats || this.seats.length === 0) return 0;

    // Lấy số hàng duy nhất
    const uniqueRows = new Set(this.seats.map(seat => seat.RowNumber));
    return uniqueRows.size;
  }

  /**
   * Lấy số lượng cột ghế tối đa
   */
  getMaxColCount(): number {
    if (!this.seats || this.seats.length === 0) return 0;

    // Nhóm ghế theo hàng
    const rowGroups = this.groupSeatsByRow();

    // Tìm hàng có nhiều cột nhất
    let maxCols = 0;
    Object.values(rowGroups).forEach(row => {
      if (row.length > maxCols) {
        maxCols = row.length;
      }
    });

    return maxCols;
  }
}













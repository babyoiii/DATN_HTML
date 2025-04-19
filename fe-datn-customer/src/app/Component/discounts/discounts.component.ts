import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { VoucherUIService } from '../../Service/voucher-ui.service';
import { VoucherUI } from '../../Models/voucher-ui.model';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { AuthServiceService } from '../../Service/auth-service.service';
import { ModalService } from '../../Service/modal.service';

@Component({
  selector: 'app-discounts',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './discounts.component.html',
  styleUrl: './discounts.component.css'
})
export class DiscountsComponent implements OnInit {
  vouchers: VoucherUI[] = [];
  loading: boolean = false;
  error: string | null = null;
  currentPage: number = 1;
  recordPerPage: number = 10;
  totalRecords: number = 0;
  isClaimingVoucher: boolean = false;

  constructor(
    private voucherService: VoucherUIService,
    private toastr: ToastrService,
    private authService: AuthServiceService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.loadVouchers();
  }

  loadVouchers(): void {
    this.loading = true;
    this.error = null;

    this.voucherService.getVoucherList(this.currentPage, this.recordPerPage).subscribe({
      next: (response) => {
        // Sắp xếp vouchers: ưu tiên hiển thị những voucher còn có thể nhận
        this.vouchers = response.data.sort((a, b) => {
          // Nếu a đã hết mà b còn, đặt b lên trước
          if (a.claimedCount >= a.maxClaimCount && b.claimedCount < b.maxClaimCount) {
            return 1;
          }
          // Nếu a còn mà b hết, đặt a lên trước
          if (a.claimedCount < a.maxClaimCount && b.claimedCount >= b.maxClaimCount) {
            return -1;
          }
          // Nếu cả hai cùng trạng thái, sắp xếp theo displayOrder
          return a.displayOrder - b.displayOrder;
        });

        this.totalRecords = response.totalRecord;
        this.loading = false;
        console.log('Loaded vouchers:', this.vouchers);
      },
      error: (err) => {
        console.error('Error loading vouchers:', err);
        this.error = 'Không thể tải danh sách voucher. Vui lòng thử lại sau.';
        this.loading = false;
      }
    });
  }

  claimVoucher(voucher: VoucherUI): void {
    // Kiểm tra xem voucher đã hết chưa
    if (voucher.claimedCount >= voucher.maxClaimCount) {
      this.toastr.warning('Voucher này đã được nhận hết', 'Thông báo');
      return;
    }

    // Kiểm tra đã đăng nhập chưa
    const isLoggedIn = localStorage.getItem('accessToken') !== null;
    if (!isLoggedIn) {
      this.toastr.warning('Bạn cần đăng nhập để nhận voucher', 'Chưa đăng nhập');
      // Mở modal đăng nhập
      this.modalService.openSignInModal();
      return;
    }

    // Lấy thông tin người dùng
    const userData = this.authService.getUserData();
    if (!userData || !userData.userId) {
      this.toastr.error('Không thể lấy thông tin người dùng', 'Lỗi');
      return;
    }

    // Tránh việc nhấn nút nhiều lần
    if (this.isClaimingVoucher) {
      return;
    }

    this.isClaimingVoucher = true;
    const loadingToast = this.toastr.info('Đang nhận voucher...', '', {
      timeOut: 0,
      tapToDismiss: false,
      closeButton: false
    });

    // Gọi API để nhận voucher
    this.voucherService.claimVoucher(voucher.voucherId, userData.userId).subscribe({
      next: (response) => {
        this.toastr.clear(loadingToast.toastId);
        this.isClaimingVoucher = false;

        // Xử lý các mã phản hồi
        if (response.responseCode === 200) {
          this.toastr.success(
            `Bạn đã nhận voucher thành công! <br>Mã voucher: ${voucher.voucherCode}`,
            'Thành công',
            { enableHtml: true }
          );

          // Tải lại danh sách voucher sau 1 giây để cập nhật số lượng claim
          setTimeout(() => {
            this.loadVouchers();
          }, 1000);
        } else {
          // Xử lý các mã lỗi
          switch (response.responseCode) {
            case -110:
              this.toastr.error('Voucher đã hết hạn', 'Lỗi');
              break;
            case -111:
              this.toastr.error('Voucher đã đạt giới hạn sử dụng', 'Lỗi');
              break;
            case -112:
              this.toastr.warning('Bạn đã nhận voucher này rồi', 'Thông báo');
              break;
            case -113:
              this.toastr.error('Voucher không tồn tại', 'Lỗi');
              break;
            case -115:
              this.toastr.error('Voucher đã bị vô hiệu hóa', 'Lỗi');
              break;
            case -116:
              this.toastr.error('Voucher chưa đến ngày bắt đầu', 'Lỗi');
              break;
            case -118:
              this.toastr.error('Voucher này đã được nhận hết', 'Lỗi');
              break;
            default:
              this.toastr.error(response.message || 'Có lỗi xảy ra khi nhận voucher', 'Lỗi');
              break;
          }
        }
      },
      error: (err) => {
        this.toastr.clear(loadingToast.toastId);
        this.isClaimingVoucher = false;
        console.error('Error claiming voucher:', err);
        this.toastr.error('Có lỗi xảy ra khi nhận voucher. Vui lòng thử lại sau.', 'Lỗi');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  getDiscountText(voucher: VoucherUI): string {
    if (voucher.discountType === 'PERCENT') {
      return `${voucher.discountValue}%`;
    } else {
      return `${voucher.discountValue.toLocaleString('vi-VN')} VNĐ`;
    }
  }
}

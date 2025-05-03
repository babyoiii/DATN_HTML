import { Component, OnInit } from '@angular/core';
import { GetListHistoryOrderByUser } from '../../../Models/Order';
import { OrdersService } from '../../../Service/Orders.Service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from '../../../Service/notification.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxSpinnerModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css',
})
export class HistoryComponent implements OnInit {
  listDataTicket: GetListHistoryOrderByUser[] = [];
  listDataFilter: GetListHistoryOrderByUser[] = [];
  selectedDateFilter: string = '30';
  yearOptions: number[] = [];
  IsRefund: boolean = false;

  // Phân trang
  currentPageUpcoming: number = 1; // Current page for upcoming tickets
  currentPagePast: number = 1; // Current page for past tickets
  itemsPerPage: number = 6; // Number of items per page
  totalRecordsUpcoming: number = 0; // Total number of records for upcoming tickets
  totalRecordsPast: number = 0; // Total number of records for past tickets
  totalPagesUpcoming: number = 1; // Total number of pages for upcoming tickets
  totalPagesPast: number = 1; // Total number of pages for past tickets

  constructor(
    private notificationService: NotificationService,
    private ordersService: OrdersService,
    private toast: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.getListTicket(this.currentPageUpcoming, this.itemsPerPage);
    this.getListTicketByDate(this.selectedDateFilter);
    this.generateYearOptions();
  }

  // Pagination for upcoming tickets
  getListTicket(currentPage: number, itemsPerPage: number): void {
    this.ordersService.getListHistoryOrderByUser(currentPage, itemsPerPage).subscribe({
      next: (response) => {
        if (response.responseCode === 200) {
          this.listDataTicket = response.data;
          this.totalRecordsUpcoming = response.totalRecord; // Separate total records for upcoming tickets
          this.totalPagesUpcoming = Math.ceil(this.totalRecordsUpcoming / this.itemsPerPage);
        }
      },
      error: (error) => {
        console.error('Error fetching ticket data:', error);
      }
    });
  }

  // Pagination for past tickets
  getListTicketByDate(date: string, currentPage: number = 1, itemsPerPage: number = 6): void {
    this.ordersService.getPastShowTimesByTimeFilter(date, currentPage, itemsPerPage).subscribe({
      next: (response) => {
        if (response.responseCode === 200) {
          this.listDataFilter = response.data;
          this.totalRecordsPast = response.totalRecord; // Separate total records for past tickets
          this.totalPagesPast = Math.ceil(this.totalRecordsPast / itemsPerPage);
        } else {
          console.warn('Unexpected response code:', response.responseCode);
        }
      },
      error: (error) => {
        console.error('Error fetching ticket data:', error);
        this.listDataFilter = [];
      },
    });
  }

  // Navigate to the previous page for upcoming tickets
  previousPageUpcoming(): void {
    if (this.currentPageUpcoming > 1) {
      this.currentPageUpcoming--;
      this.getListTicket(this.currentPageUpcoming, this.itemsPerPage);
    }
  }

  // Navigate to the next page for upcoming tickets
  nextPageUpcoming(): void {
    if (this.currentPageUpcoming < this.totalPagesUpcoming) {
      this.currentPageUpcoming++;
      this.getListTicket(this.currentPageUpcoming, this.itemsPerPage);
    }
  }

  // Navigate to the previous page for past tickets
  previousPagePast(date: string): void {
    if (this.currentPagePast > 1) {
      this.currentPagePast--;
      this.getListTicketByDate(date, this.currentPagePast, this.itemsPerPage);
    }
  }

  // Navigate to the next page for past tickets
  nextPagePast(date: string): void {
    if (this.currentPagePast < this.totalPagesPast) {
      this.currentPagePast++;
      this.getListTicketByDate(date, this.currentPagePast, this.itemsPerPage);
    }
  }

  private generateYearOptions(): void {
    const currentYear = new Date().getFullYear();
    const startYear = 2013;
    this.yearOptions = Array.from(
      { length: currentYear - startYear + 1 },
      (_, i) => currentYear - i
    );
  }

  onDateFilterChange(): void {
    console.log('Selected filter:', this.selectedDateFilter);
    this.getListTicketByDate(this.selectedDateFilter);
  }

  isRefundDisabled(status: number): boolean {
    return status !== 1;
  }

  onRefundOrder(orderId: string): void {
    if (!orderId) {
      console.error('Order ID không hợp lệ!');
      return;
    }

    const toastRef = this.toast.info('Đang xử lý yêu cầu hoàn vé...', 'Vui lòng chờ', {
      disableTimeOut: true,
      closeButton: true,
    });
    this.spinner.show();
    this.ordersService.refundOrder(orderId).subscribe({
      next: (response: any) => {
        this.toast.clear(toastRef.toastId);

        if (response.responseCode === 200) {
          const pointsRefunded = response.data?.pointRefund || 0;
          this.notificationService.onSuccessNotification(
            `Hoàn vé thành công! Số điểm được hoàn là: ${pointsRefunded}`
          );
          this.getListTicket(this.currentPageUpcoming, this.itemsPerPage); // Cập nhật danh sách vé
        } else {
          this.notificationService.onErrorNotification(`${response.message}`);
        }
        this.spinner.hide();
      },
      error: (error) => {
        this.toast.clear(toastRef.toastId);
        this.spinner.hide();
        console.error('Lỗi khi hoàn vé:', error);
        this.notificationService.onErrorNotification('Đã xảy ra lỗi khi hoàn vé.');
      },
    });
  }
}
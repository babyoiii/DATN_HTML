import { Component, OnInit } from '@angular/core';
import { GetListHistoryOrderByUser } from '../../../Models/Order';
import { OrdersService } from '../../../Service/Orders.Service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  listDataTicket: GetListHistoryOrderByUser[] = [];
  listDataFilter: GetListHistoryOrderByUser[] = [];
  selectedDateFilter: string = '30';
  yearOptions: number[] = [];
  IsRefund : boolean = false;
  constructor(private ordersService : OrdersService,private toast : ToastrService) { }

  ngOnInit(): void {
   this.getListTicket()
   this.getListTicketByDate(this.selectedDateFilter);
   this.generateYearOptions();
  }
  getListTicket() {
    this.ordersService.getListHistoryOrderByUser().subscribe({
      next: (response) => {
        if (response.responseCode == 200) {
          this.listDataTicket = response.data;
          console.log(this.listDataTicket, 'listDataTicket');
        }
      },
      error: (error) => {
        // console.error('Error fetching ticket data:', error);
      }
    });
  }
  private generateYearOptions(): void {
    const currentYear = new Date().getFullYear();
    const startYear = 2013; 
    this.yearOptions = Array.from(
      { length: currentYear - startYear + 1 },
      (_, i) => currentYear - i
    );
  }
  onDateFilterChange() {
    console.log('Selected filter:', this.selectedDateFilter);
    this.getListTicketByDate(this.selectedDateFilter);
  }
 
  getListTicketByDate(date: string) {
    this.ordersService.getPastShowTimesByTimeFilter(date).subscribe({
      next: (response) => {
        if (response.responseCode === 200) {
          this.listDataFilter = response.data;
          console.log('listDataTicket:', this.listDataFilter);
        } else {
          console.warn('Unexpected response code:', response.responseCode);
        }
      },
      error: (error) => {
        // console.error('Error fetching ticket data:', error);
        this.listDataFilter = [];
      },
    });
  
}
isRefundDisabled(status: number): boolean {
  return status !== 1;
}
onRefundOrder(orderId: string): void {
  if (!orderId) {
    console.error('Order ID không hợp lệ!');
    return;
  }

  // Hiển thị thông báo chờ
  const toastRef = this.toast.info('Đang xử lý yêu cầu hoàn vé...', 'Vui lòng chờ', {
    disableTimeOut: true, 
    closeButton: true, 
  });

  this.ordersService.refundOrder(orderId).subscribe({
    next: (response: any) => {
      this.toast.clear(toastRef.toastId);

      if (response.responseCode === 200) {
        const pointsRefunded = response.data?.pointRefund || 0; 
        this.toast.success(`Hoàn vé thành công! Số điểm được hoàn là: ${pointsRefunded}`, 'Thông báo');
        this.getListTicket(); 
      } else {
        this.toast.error('Không thể hoàn vé. Vui lòng thử lại sau.', 'Lỗi');
      }
    },
    error: (error) => {
      this.toast.clear(toastRef.toastId);

      console.error('Lỗi khi hoàn vé:', error);
      this.toast.error('Đã xảy ra lỗi khi hoàn vé.', 'Lỗi');
    }
  });
}
}
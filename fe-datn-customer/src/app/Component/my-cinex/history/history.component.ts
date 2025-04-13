import { Component, OnInit } from '@angular/core';
import { GetListHistoryOrderByUser } from '../../../Models/Order';
import { OrdersService } from '../../../Service/Orders.Service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
  constructor(private ordersService : OrdersService) { }

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
        console.error('Error fetching ticket data:', error);
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
  checkRefund(orderId: string): boolean {
    let isRefundable = false;
    this.ordersService.checkRefund(orderId).subscribe({
      next: (response) => {
        if (response.responseCode == 200) {
          isRefundable = response.data;
        }
      },
      error: (error) => {
        console.error('Error checking refund:', error);
      },
    });
    return isRefundable;
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
        console.error('Error fetching ticket data:', error);
        this.listDataFilter = [];
      },
    });
   
}
}
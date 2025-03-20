import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SeatService } from '../../Service/seat.service';
import { CommonModule } from '@angular/common';
import { OrdersService } from '../../Service/Orders.Service';
import { log } from 'node:console';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase.component.html',
  styleUrl: './purchase.component.css'
})
export class PurchaseComponent implements OnInit {
  countdown: string | null = null;
  seats: {
    type: string; count: number; total: number; seatIds: string[]
  }[] = [];

  services: { id: string; name: string; price: number; quantity: number }[] = [];
  totalAmount: number = 0;
  totalTicketPrice: number = 0;
  totalServiceAmount: number = 0;
  fee: number = 0;
  email: string = ''
  constructor(
    private seatService: SeatService,
    private cdr: ChangeDetectorRef,
    private orderService: OrdersService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.seatService.getJoinRoomMessages().subscribe({
      next: (count) => {
        if (count !== null) {
          const minutes = Math.floor(count / 60);
          const seconds = count % 60;
          this.countdown = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          this.cdr.markForCheck();
          // console.log('⏳ [PurchaseComponent] Countdown:', this.countdown);
        }
      },
      error: (err) => console.error('❌ Lỗi khi nhận countdown:', err)
    });

    this.loadData();
    console.log('seatDataa',this.seats)
  }

  loadData() {
    const orderDataString = localStorage.getItem('orderData');
    if (orderDataString) {
      try {
        const orderData = JSON.parse(orderDataString);

        // Gán dữ liệu vào các biến
        console.log(orderData, 'dataOrder');

        this.seats = Object.entries(orderData.seats).map(([type, data]: any) => ({
          type : data.type,
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
  onPurchase() {
    if (!this.email) {
      this.toastr.warning('Vui lòng nhập email.');
      return;
    }
  
    const allSeatIds = this.seats.flatMap(seat => seat.seatIds);
  
    const orderData = {
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
  
      totalAmount: this.totalAmount,
      totalTicketPrice: this.totalTicketPrice,
      totalServiceAmount: this.totalServiceAmount,
      fee: this.fee
    };
  
    console.log('dataa', orderData);
  
    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        console.log('✅ Đơn hàng đã được tạo thành công:', response);
        localStorage.removeItem('selectedSeats');
        localStorage.removeItem('orderData');
      },
      error: (error) => {
        console.error('❌ Lỗi khi tạo đơn hàng:', error);
      }
    });
  }
}


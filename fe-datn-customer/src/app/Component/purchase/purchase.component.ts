import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrdersService } from '../../Service/Orders.Service';
import { OrderModelReq, PaymentModelReq } from '../../Models/Order';
import { SeatService } from '../../Service/seat.service';

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

  constructor(
    private seatService: SeatService,
    private cdr: ChangeDetectorRef,
    private orderService: OrdersService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
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
  private notifyAndRedirect(): void {
    this.toastr.warning('Thời gian giữ ghế đã hết, bạn sẽ được chuyển hướng.', 'Cảnh báo');
    setTimeout(() => {
      this.router.navigate(['/']); 
    }, 3000); 
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

  createPayment(paymentData: PaymentModelReq) {
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
  }
}
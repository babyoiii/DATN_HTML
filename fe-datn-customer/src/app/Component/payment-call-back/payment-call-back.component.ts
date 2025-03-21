import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { OrdersService } from '../../Service/Orders.Service';
import { OrderModelReq } from '../../Models/Order';
import { ToastrService } from 'ngx-toastr';
import { log } from 'node:console';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-call-back.component.html',
  styleUrls: ['./payment-call-back.component.css']
})
export class PaymentCallBackComponent implements OnInit {
  isSuccess = false;
  responseCode = '';
  orderId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordersService: OrdersService,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.responseCode = params['vnp_ResponseCode'];
      this.orderId = params['vnp_TxnRef'];
      const orderDataString = localStorage.getItem('orderDataPayment');
      console.log(orderDataString,'dataaaaa');
      
      this.isSuccess = this.responseCode === '00';
      console.log('🔔 [PaymentCallBackComponent] - responseCode:', this.responseCode);
      if (this.isSuccess = true) {
        this.createOrder();
      } else {
        this.toastr.error('❌ Thanh toán thất bại.', "Thông Báo");
      }
    });
  }

  createOrder() {
    const orderDataString = localStorage.getItem('orderDataPayment');
    if (orderDataString) {
      try {
        const orderData: OrderModelReq = JSON.parse(orderDataString);
        this.ordersService.createOrder(orderData).subscribe({
          next: (response) => {
            this.toastr.success('✅ Đơn hàng đã được tạo thành công:', "Thông Báo!");
            localStorage.removeItem('selectedSeats');
            localStorage.removeItem('orderData');
            this.router.navigate(['/']);
          },
          error: (error) => {
            this.toastr.error('❌ Lỗi khi tạo đơn hàng:', "Thông Báo");
          }
        });
      } catch (error) {
        console.error('❌ Lỗi khi parse dữ liệu order:', error);
      }
    } else {
      console.warn('⚠️ Không tìm thấy dữ liệu order trong localStorage.');
    }
  }

  backToHome() {
    this.router.navigate(['/']);
  }
}
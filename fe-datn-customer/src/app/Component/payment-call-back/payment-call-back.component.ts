import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-call-back.component.html',
  styleUrls: ['./payment-call-back.component.css']
})
export class PaymentCallBackComponent implements OnInit {
  responseCode = '';
  transactionCode: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.responseCode = params['vnp_ResponseCode'];
      this.transactionCode = params['vnp_TxnRef'];
      const isSuccess = this.responseCode === '00';
      if (isSuccess) {
        window.opener?.postMessage({
          type: 'PAYMENT_SUCCESS',
          transactionCode: this.transactionCode
        }, '*');
        this.toastr.success('✅ Thanh toán thành công, đang xử lý đơn hàng...', "Thông Báo");
      } else {
        window.opener?.postMessage({
          type: 'PAYMENT_FAILED',
          transactionCode: this.transactionCode
        }, '*');
        this.toastr.error('❌ Thanh toán thất bại.', "Thông Báo");
      }
      setTimeout(() => window.close(), 3000);
    });
  }
}
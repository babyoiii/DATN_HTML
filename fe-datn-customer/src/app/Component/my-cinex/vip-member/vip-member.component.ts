import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaymentMethod } from '../../../Models/Order';
import { OrdersService } from '../../../Service/Orders.Service';

@Component({
  selector: 'app-vip-member',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './vip-member.component.html',
  styleUrl: './vip-member.component.css'
})
export class VipMemberComponent implements OnInit {
 listPaymentMethod : PaymentMethod[] = []
 email : string = ''
 constructor(private orderService: OrdersService) { }
  ngOnInit(): void {
    this.email = localStorage.getItem('email') || ''
    this.getPaymentMethod()
  }
  getPaymentMethod(){
    this.orderService.getPaymentMethod().subscribe({
      next:(res:any) =>{
        this.listPaymentMethod = res.data
        console.log(this.listPaymentMethod,'Payment Method');
      },
      error: (error) => {
        console.error('Error get payment:', error);
      }
    })
  }
  onPaymentMethodChange(method: string): void {
    // this.selectedPaymentId = method;
    // this.selectedPaymentMethod = this.listPaymentMethod.find(item => item.id === method)?.paymentMethodName || null;

    // if (this.selectedPaymentMethod === 'MULTI-WALLET') {
    //   const usdcAmount = this.convertVNDToUSDC(this.totalAmount);
    //   if (usdcAmount !== null) {
    //     this.displayAmount = usdcAmount.toFixed(6); 
    //     this.displayCurrency = 'USDC'; 
    //   } else {
    //     this.displayAmount = 'N/A'; 
    //     this.displayCurrency = 'USDC';
    //   }
    // } else {

    //   this.displayAmount = this.totalAmount.toLocaleString('vi-VN');
    //   this.displayCurrency = 'VND'; 
    // }
  }
}

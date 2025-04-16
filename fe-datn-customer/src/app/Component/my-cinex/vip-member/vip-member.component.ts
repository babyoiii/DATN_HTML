import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaymentMethod } from '../../../Models/Order';
import { OrdersService } from '../../../Service/Orders.Service';
import { CommonModule } from '@angular/common';
import { MembershipService } from '../../../Service/membership.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vip-member',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './vip-member.component.html',
  styleUrl: './vip-member.component.css'
})
export class VipMemberComponent implements OnInit {
 listPaymentMethod : PaymentMethod[] = []
 email : string = ''
 totalAmount : number = 0
 membershipId : number = 0
 selectedPaymentId : string = ''
 selectedPaymentMethod: string | null = null

 constructor(private router : Router,private orderService: OrdersService,private membershipService : MembershipService,private toast : ToastrService) { }
  ngOnInit(): void {
    this.email = localStorage.getItem('email') || ''
    this.totalAmount = Number(localStorage.getItem('membershipPriceNext')) || 0
    this.membershipId = Number(localStorage.getItem('nextLevelBenefitsId')) || 0
    this.getPaymentMethod()
    console.log(this.email,'email');
    console.log(this.totalAmount,'totalAmount');
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
  addMembership(): void {
    const payload = {
      membershipId: this.membershipId,
      paymentMethodId: this.selectedPaymentId
    };
    console.log(payload,'payload');
    
    this.membershipService.addUserMembership(payload).subscribe({
      next: (response) => {
       this.toast.success('Mua thẻ thành viên thành công:', "Thông báo");
       this.router.navigate(['/my-cinex']);
      },
      error: (error) => {
        this.toast.error('Error adding membership:', error);
      }
    });
  }
  onPaymentMethodChange(method: string): void {
    this.selectedPaymentId = method;
    this.selectedPaymentMethod = this.listPaymentMethod.find(item => item.id === method)?.paymentMethodName || null;
}
}
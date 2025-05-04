import { Component, OnInit } from '@angular/core';
import { MembershipService } from '../../../Service/membership.service';
import { MembershipData } from '../../../Models/Membership';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { log } from 'node:console';

@Component({
  selector: 'app-benefits',
  standalone: true,
  imports: [CommonModule,RouterLink,NgxSpinnerModule],
  templateUrl: './benefits.component.html',
  styleUrl: './benefits.component.css'
})
export class BenefitsComponent implements OnInit {
  membershipData: MembershipData = {
    userMembershipDetails: {
      userName: '',
      memberCode: '',
      memberCodeBase64: '',
      membershipName: '',
      membershipPrice: 0,
      membershipPriceNext: 0,
      purchasedAt: '',
      expiryDate: '',
      membershipLevel: 0,
    },
    currentLevelBenefits: [],
    nextLevelBenefits: [],
  };
  membershipName : string = '';
 constructor( private membershipService : MembershipService,private spinner: NgxSpinnerService) { }
  ngOnInit(): void {
    this.getMembershipData();
   
  }
  getMembershipData(): void {
    this.membershipService.getMembershipByUserRes().subscribe({
      next: (response) => {
        this.membershipData = response.data;
        console.log(response.data, 'Membership Data List');
  
        const membershipPriceNext = this.membershipData.nextLevelBenefits[0]?.membershipPriceNext ?? 0; // Giá trị mặc định là 0
        console.log(membershipPriceNext, 'Membership Price Next');
        
        localStorage.setItem('membershipPriceNext', JSON.stringify(membershipPriceNext));
  
        localStorage.setItem(
          'nextLevelBenefitsId',
          JSON.stringify(this.membershipData.nextLevelBenefits[0]?.membershipId)
        );
  
        localStorage.setItem(
          'membershipNameNext',
          JSON.stringify(this.membershipData.nextLevelBenefits[0]?.membershipName)
        );
  
        this.membershipName = this.membershipData.currentLevelBenefits[0]?.membershipName ?? '';
  
        console.log(this.membershipData.nextLevelBenefits[0]?.membershipName, 'MembershipNameNext');
      },
      error: (error) => {
        console.error('Error fetching membership data:', error);
      }
    });
  }
checkNextLevelBenefits(): boolean {
  if (this.membershipData.nextLevelBenefits.length > 0) {
    return true; 
  }
  return false;
}
}
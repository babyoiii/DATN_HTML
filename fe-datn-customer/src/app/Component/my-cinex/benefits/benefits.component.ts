import { Component, OnInit } from '@angular/core';
import { MembershipService } from '../../../Service/membership.service';
import { MembershipData } from '../../../Models/Membership';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-benefits',
  standalone: true,
  imports: [CommonModule,RouterLink],
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
 constructor( private membershipService : MembershipService) { }
  ngOnInit(): void {
    this.getMembershipData();
   
  }
  getMembershipData(): void {
    this.membershipService.getMembershipByUserRes().subscribe({
      next: (response) => {
        this.membershipData = response.data;
        localStorage.setItem('membershipPriceNext', JSON.stringify(this.membershipData.userMembershipDetails.membershipPriceNext));
       
        console.log(this.membershipData.nextLevelBenefits[0]?.membershipId, 'membershipPriceNextId');
        localStorage.setItem('nextLevelBenefitsId', JSON.stringify(this.membershipData.nextLevelBenefits[0]?.membershipId));
      },
      error: (error) => {
        // console.error('Error fetching membership data:', error);
      }
    });
}
}
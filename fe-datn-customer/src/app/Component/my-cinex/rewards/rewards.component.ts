import { Component, OnInit } from '@angular/core';
import { RewardPointData } from '../../../Models/Membership';
import { MembershipService } from '../../../Service/membership.service';

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [],
  templateUrl: './rewards.component.html',
  styleUrl: './rewards.component.css'
})
export class RewardsComponent implements OnInit {
 getRewardPoint : RewardPointData = {
  totalPoint: 0,
  pointRate: 0,
  rewardPoint: 0
 }
 caculateRewardPoint: number = 0;
 constructor(private membershipService: MembershipService) { }
 ngOnInit(): void {
  this.membershipService.getPointByUser().subscribe({
    next: (res: any) => {
      this.getRewardPoint = res.data;
      this.caculateRewardPoint = 1000 * this.getRewardPoint.pointRate;
      console.log('Reward Point Data:', this.getRewardPoint);
    },
    error: (err) => {
      console.error('Error fetching points:', err);
    }
  });

}
}

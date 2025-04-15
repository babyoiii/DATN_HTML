import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PointHistory, RewardPointData } from '../../../Models/Membership';
import { MembershipService } from '../../../Service/membership.service';
@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [CommonModule],
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
activeTab: 'earned' | 'redeemed' = 'earned';
  
  // Dữ liệu cho điểm đã nhận (đã bỏ icon)
  earnedPoints: PointHistory[] = [
    {
      title: 'Mua vé xem phim',
      date: '15/04/2025',
      points: 1000
    },
    {
      title: 'Mua đồ ăn',
      date: '10/04/2025',
      points: 500
    },
    {
      title: 'Đăng ký thành viên',
      date: '01/04/2025',
      points: 2000
    },
    {
      title: 'Mua vé xem phim',
      date: '16/04/2025',
      points: 1500
    },
    {
      title: 'Mua vé xem phim',
      date: '17/04/2025',
      points: 2000
    },
  ];
  
  // Dữ liệu cho điểm đã đổi (đã bỏ icon)
  redeemedPoints: PointHistory[] = [
    {
      title: 'Nâng cấp membership',
      date: '14/04/2025',
      points: -500
    },
    {
      title: 'Đổi vé xem phim',
      date: '05/04/2025',
      points: -2000
    }
  ];
  
  // Phương thức để chuyển đổi tab
  setActiveTab(tab: 'earned' | 'redeemed'): void {
    this.activeTab = tab;
  }
}

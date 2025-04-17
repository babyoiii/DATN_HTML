import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PointHistory, RewardPointData } from '../../../Models/Membership';
import { MembershipService } from '../../../Service/membership.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './rewards.component.html',
  styleUrl: './rewards.component.css'
})
export class RewardsComponent implements OnInit {
  getRewardPoint: RewardPointData = {
    totalPoint: 0,
    pointRate: 0,
    rewardPoint: 0
  };
  pointHistory: PointHistory[] = [];
  caculateRewardPoint: number = 0;
  currentPage: number = 1;
  recordPerPage: number = 5
  totalRecord: number = 0;
  type: number = 1; 

  activeTab: 'earned' | 'redeemed' = 'earned';

  constructor(private membershipService: MembershipService) {}

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

    this.loadPointHistory();
  }

  loadPointHistory(): void {
    this.membershipService.getPointHistory(this.type, this.currentPage, this.recordPerPage).subscribe({
      next: (response: any) => {
        this.pointHistory = response.data;
        console.log('Lịch sử điểm:', this.pointHistory);
      },
      error: (err) => {
        console.error('Lỗi khi lấy lịch sử điểm:', err);
      }
    });
  }
  onScroll(event: any): void {
    const element = event.target;
  
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      this.currentPage++; 
      this.loadPointHistory(); 
    }
  }
  

  setActiveTab(tab: 'earned' | 'redeemed'): void {
    this.activeTab = tab;
    this.type = tab === 'earned' ? 1 : 0; 
    this.loadPointHistory(); 
  }
}
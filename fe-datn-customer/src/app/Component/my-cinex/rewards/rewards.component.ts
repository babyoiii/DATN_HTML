import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PointHistory, RewardPointData } from '../../../Models/Membership';
import { MembershipService } from '../../../Service/membership.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
  recordPerPage: number = 10
  totalRecord: number = 0;
  type: number = 1;
  isLoading: boolean = false;
  hasMoreData: boolean = true;

  activeTab: 'earned' | 'redeemed' = 'earned';

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

    this.loadPointHistory();
  }

  loadPointHistory(reset: boolean = false): void {
    // Không tiếp tục nếu đang tải hoặc đã hết dữ liệu (trừ khi reset)
    if ((this.isLoading || !this.hasMoreData) && !reset) return;

    this.isLoading = true;

    // Reset data when changing tabs or explicitly requested
    if (reset) {
      this.currentPage = 1;
      this.pointHistory = [];
      this.hasMoreData = true;
    }

    this.membershipService.getPointHistory(this.type, this.currentPage, this.recordPerPage).subscribe({
      next: (response: any) => {
        const newData = response.data;

        if (!newData || newData.length === 0) {
          this.hasMoreData = false;
          console.log('Đã tải hết dữ liệu');
        } else {
          if (reset) {
            // Nếu reset, thay thế mảng cũ
            this.pointHistory = [...newData];
          } else {
            // Nếu không, thêm vào mảng hiện có
            this.pointHistory = [...this.pointHistory, ...newData];
          }
          console.log('Lịch sử điểm (trang ' + this.currentPage + '):', newData);

          if (newData.length < this.recordPerPage) {
            this.hasMoreData = false;
          }
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi lấy lịch sử điểm:', err);
        this.isLoading = false;
      }
    });
  }
  onScroll(event: any): void {
    const element = event.target;

    const threshold = 20; // pixels from bottom - tăng ngưỡng để tải sớm hơn
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + threshold;

    if (isAtBottom && !this.isLoading && this.hasMoreData) {
      this.currentPage++;
      this.loadPointHistory(false);
    }
  }


  setActiveTab(tab: 'earned' | 'redeemed'): void {
    this.activeTab = tab;
    this.type = tab === 'earned' ? 1 : 0;
    this.loadPointHistory(true);
  }
}
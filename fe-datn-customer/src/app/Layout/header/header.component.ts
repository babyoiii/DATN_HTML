import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ModalService } from '../../Service/modal.service';
import { AuthServiceService } from '../../Service/auth-service.service';
import { Subscription } from 'rxjs';
import { RewardPointData } from '../../Models/Membership';
import { MembershipService } from '../../Service/membership.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
   getRewardPoint: RewardPointData = {
      totalPoint: 0,
      pointRate: 0,
      rewardPoint: 0
    };
  caculateRewardPoint: number = 0;
  isLoggedIn: boolean = false;
  isDropdownOpen: boolean = false;
  private subscription!: Subscription;
  displayName : string = ''
  constructor(
    public modalService: ModalService,
    private authService: AuthServiceService,
    private membershipService: MembershipService,
    private router  : Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.displayName = localStorage.getItem('displayName') || '';
    }
    this.subscription = this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      console.log('Login status from BehaviorSubject:', status);
    });
    this.membershipService.getPointByUser().subscribe({
      next: (res: any) => {
        this.getRewardPoint = res.data;
        this.caculateRewardPoint = 1000 * this.getRewardPoint.pointRate;
        console.log('Reward Point Data:', this.getRewardPoint);
      },
      error: (err) => {
        // console.error('Error fetching points:', err);
      }
    });

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  openSignIn() {
    const currentUrl = this.router.url;
      localStorage.setItem('redirectUrl', currentUrl);
  }

  // Sử dụng hàm checkLogin() để kiểm tra trạng thái đăng nhập
  checkLogin(): boolean {
    const logged = this.authService.isLoggedIn();
    console.log('checkLogin() returns:', logged);
    return logged;
  }

  signOut() {
    this.authService.SignOut();
    this.isLoggedIn = false;
    this.isDropdownOpen = false;
    console.log('Đăng xuất thành công');
  }

  toggleDropdown(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  showDropdown() {
    if (this.isLoggedIn) {
      this.isDropdownOpen = true;
    }
  }

  hideDropdown() {
    setTimeout(() => {
      if (!this.isHovering) {
        this.isDropdownOpen = false;
      }
    }, 200);
  }

  private isHovering = false;

  onMouseEnterDropdown() {
    this.isHovering = true;
  }

  onMouseLeaveDropdown() {
    this.isHovering = false;
    this.hideDropdown();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (isPlatformBrowser(this.platformId)) {
      const userMenuButton = document.getElementById('user-menu-button');
      const dropdownMenu = document.querySelector('.dropdown-menu');
      if (!userMenuButton?.contains(event.target as Node) &&
          !dropdownMenu?.contains(event.target as Node) &&
          this.isDropdownOpen) {
        this.isDropdownOpen = false;
      }
    }
  }


}

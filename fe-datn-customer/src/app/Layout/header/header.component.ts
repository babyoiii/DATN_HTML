import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../Service/modal.service';
import { AuthServiceService } from '../../Service/auth-service.service';
import { Subscription } from 'rxjs';
import { log } from 'node:console';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  isDropdownOpen: boolean = false;
  private subscription!: Subscription;

  constructor(
    public modalService: ModalService,
    private authService: AuthServiceService
  ) { }

  ngOnInit() {
    this.subscription = this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      console.log('NGHĨA NGHĨA NGHĨA NGHÍA Login:', status);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  openSignIn() {
    this.modalService.openSignInModal();
  }

  checkLogin(): boolean {
    return this.authService.isLoggedIn();
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

  // Xử lý khi hover
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

  // Biến tạm để kiểm tra hover
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
    const userMenuButton = document.getElementById('user-menu-button');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (!userMenuButton?.contains(event.target as Node) &&
        !dropdownMenu?.contains(event.target as Node) &&
        this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }

}

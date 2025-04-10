import { Component } from '@angular/core';
import { ChangePasswordModel, UserInfo } from '../../../Models/AuthModel';
import { AuthServiceService } from '../../../Service/auth-service.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { log } from 'node:console';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  userInfo: UserInfo | null = null;
  changePassword: ChangePasswordModel | null = null;
  constructor(private authService: AuthServiceService,private toast : ToastrService) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId') || ''; 
    this.getUserInformation(userId);
  }

  getUserInformation(userId: string): void {
    this.authService.getUserInformation(userId).subscribe({
      next: (data: any) => {
        this.userInfo = data.data;
        console.log('User Information:', this.userInfo);
      },
      error: (error) => {
        console.error('Error fetching user information:', error);
      }
    });
  }
  onChangePassword(): void {
    console.log(this.changePassword);
  }
}

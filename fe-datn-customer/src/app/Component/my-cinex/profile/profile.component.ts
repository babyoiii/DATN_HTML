import { Component } from '@angular/core';
import { UserInfo } from '../../../Models/AuthModel';
import { AuthServiceService } from '../../../Service/auth-service.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  userInfo: UserInfo | null = null;

  constructor(private authService: AuthServiceService) {}

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
}

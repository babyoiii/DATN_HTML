import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../Service/auth-service.service';
import { ModalService } from '../../Service/modal.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  SignInData: any = {
    userName: '',
    password: ''
  };

  constructor(
    private authService: AuthServiceService, 
    private router: Router,
    public modalService: ModalService
  ) {}

  onSubmit() {
    console.log(">> signInData: ", this.SignInData);
    this.authService.SignIn(this.SignInData).subscribe({
      next: (result: any) => {
        console.log('Response:', result);
        console.log('Message:', result.message);
        console.log('Data:', result.data);

        if (result && result.data) {
          const { accessToken, refreshToken, roles } = result.data;
          console.log('Access Token:', accessToken);
          console.log('Refresh Token:', refreshToken);
          console.log('Roles:', roles);

          this.authService.saveToken(accessToken);
          this.modalService.closeSignInModal();
          this.router.navigate(['/']); 
        } else {
          console.error('No data found in the response');
        }
      },
      error: (error: any) => {
        console.log('Error:', error);
      }
    });
  }
  
  closeModal() {
    this.modalService.closeSignInModal();
  }
}
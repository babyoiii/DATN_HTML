import { Component } from '@angular/core';
import { AuthServiceService } from '../../Service/auth-service.service';
import { SignIn } from '../../Models/AuthModel';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  SignInData: SignIn = {
    userName: '',
    password: ''
  };

  constructor(private AuthService: AuthServiceService, private http: HttpClient, private router: Router) {}

  onSubmit() {
    console.log(">> signInData: ",this.SignInData);
    this.AuthService.SignIn(this.SignInData).subscribe({
      next: (result: any) => {
        console.log('Response:', result); // nó chưua log đc vào đây anh
        console.log('Message:', result.message);
        console.log('Data:', result.data);

        if (result && result.data) {
          const { accessToken, refreshToken, roles } = result.data;
          console.log('Access Token:', accessToken);
          console.log('Refresh Token:', refreshToken);
          console.log('Roles:', roles);

          this.AuthService.saveToken(accessToken);
          this.router.navigate(['/']); // Navigate to the desired route
        } else {
          console.error('No data found in the response');
        }
      },
      error: (error) => {
        console.log('Error:', error);
      }
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../Service/modal.service';
import { AuthServiceService } from '../../Service/auth-service.service';
@Component({
  selector: 'app-refund',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './refund.component.html',
  styleUrl: './refund.component.css'
})
export class RefundComponent {

}

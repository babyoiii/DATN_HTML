import { Component, OnInit } from '@angular/core';
import { SeatService } from '../../Service/seat.service';
import { ModalService } from '../../Service/modal.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-need-more-time',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './need-more-time.component.html',
  styleUrl: './need-more-time.component.css'
})
export class NeedMoreTimeComponent {
 constructor(private seatService : SeatService,
          public modalService: ModalService,
          private toast: ToastrService
 ){}
  onNeedMoreTime() {
    localStorage.removeItem('roomCountdown');
    this.seatService.extendCountdown(120);
    this.toast.success('⏳ Thời gian đã được gia hạn thêm 2 phút.', "Thông Báo");
    this.closeModal();
  }
  closeModal(): void {
    this.modalService.closeNeedMoreTimeModal();
  }
}

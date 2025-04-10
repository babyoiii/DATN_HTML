import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ModalService } from '../../Service/modal.service';

@Component({
  selector: 'app-time-up',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time-up.component.html',
  styleUrls: ['./time-up.component.css']
})
export class TimeUpComponent {
  isOpen: boolean = false;




  constructor(

          public modalService: ModalService,
  ) { }

  openDialog(): void {
    this.isOpen = true;
  }

  closeDialog(): void {
    this.isOpen = false;
  }
}
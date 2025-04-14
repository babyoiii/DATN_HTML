import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../Service/modal.service';
import { TimeUpComponent } from "../time-up/time-up.component";

@Component({
  selector: 'app-test-dialog',
  standalone: true,
  imports: [RouterLink, CommonModule, TimeUpComponent],
  templateUrl: './test-dialog.component.html',
  styleUrl: './test-dialog.component.css'
})
export class TestDialogComponent {
  constructor(public modalService: ModalService) {}

  closeDialog(): void {
    this.modalService.closeTimeUpModal();
  }
}

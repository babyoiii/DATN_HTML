import { Component, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData {
  type: 'success' | 'error' | 'warning';
  message: string;
}

@Component({
  selector: 'app-notification-dialog',
  templateUrl: './notification-dialog.component.html',
  styleUrls: ['./notification-dialog.component.css'],
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  animations: [
    trigger('dialogAnimation', [
      state('void', style({ opacity: 0, transform: 'scale(0.9)' })),
      transition(':enter', [
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})
export class NotificationDialogComponent implements AfterViewInit {
  constructor(
    public dialogRef: MatDialogRef<NotificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.dialogRef.close();
    }, 1000); 
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
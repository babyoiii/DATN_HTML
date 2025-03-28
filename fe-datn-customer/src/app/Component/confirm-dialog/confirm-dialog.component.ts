import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="bg-gray-800 text-white p-6 rounded-lg max-w-md">
      <h2 class="text-xl font-bold mb-4">{{ data.title }}</h2>
      <p class="mb-6">{{ data.message }}</p>
      <div class="flex justify-end gap-4">
        <button 
          mat-button 
          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          (click)="onCancel()">
          Hủy
        </button>
        <button 
          mat-button 
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          (click)="onConfirm()">
          Xác nhận
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
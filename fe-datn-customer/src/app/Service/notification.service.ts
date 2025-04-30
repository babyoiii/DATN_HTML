import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  onSuccessNotification(message: string): void {
    Swal.fire({
      title: 'Thành công!',
      text: `${message}`,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
      background: '#f9f9f9',
      customClass: {
        popup: 'swal2-popup-custom',
      },
      timer: 3000,
      timerProgressBar: true,
    });
  }

  onInfoNotification(message: string): void {
    Swal.fire({
      title: 'Thông báo!',
      text: `${message}`,
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
      background: '#f9f9f9',
      customClass: {
        popup: 'swal2-popup-custom',
      },
      timer: 2000,
      timerProgressBar: true,
    });
  }

  onErrorNotification(message: string): void {
    Swal.fire({
      title: 'Thất bại!',
      text: `${message}`,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#d33',
      background: '#f9f9f9',
      customClass: {
        popup: 'swal2-popup-custom',
      },
      timer: 2000,
      timerProgressBar: true,
    });
  }
  onWarningNotification(message: string): void {
    Swal.fire({
      title: 'Cảnh báo!',
      text: `${message}`,
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: '#f0ad4e', 
      background: '#f9f9f9', // Màu nền
      customClass: {
        popup: 'swal2-popup-custom',
      },
      timer: 2000, 
      timerProgressBar: true, 
    });
  }
  onConfirmNotification(
    message: string,
    title: string = 'Xác nhận',
    confirmButtonText: string = 'Yes',
    cancelButtonText: string = 'No'
  ): Promise<boolean> {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'question', 
      showCancelButton: true, 
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      confirmButtonColor: '#3085d6', 
      cancelButtonColor: '#d33', 
      background: '#f9f9f9',
      customClass: {
        popup: 'swal2-popup-custom',
      },
    }).then((result) => {
      return result.isConfirmed; 
    });
  }
}

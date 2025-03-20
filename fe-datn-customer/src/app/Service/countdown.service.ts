import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CountdownService {
  private countdown$ = new BehaviorSubject<number>(0); // Giá trị đếm ngược hiện tại
  private countdownValue = 0; // Lưu trữ giá trị countdown trong bộ nhớ
  private countdownInterval: any;

  constructor() {
    this.restoreCountdown();
  }

  // Phục hồi countdown từ localStorage
  private restoreCountdown() {
    const storedCountdown = localStorage.getItem('roomCountdown');
    if (storedCountdown) {
      const countdown = parseInt(storedCountdown, 10);
      if (!isNaN(countdown)) {
        this.startCountdown(countdown);
      }
    }
  }

  // Bắt đầu đếm ngược
  startCountdown(seconds: number) {
    clearInterval(this.countdownInterval);

    this.countdownValue = seconds;
    this.countdown$.next(this.countdownValue);

    this.countdownInterval = setInterval(() => {
      if (this.countdownValue > 0) {
        this.countdownValue--;
        this.countdown$.next(this.countdownValue);
        localStorage.setItem('roomCountdown', this.countdownValue.toString());
      } else {
        clearInterval(this.countdownInterval);
        this.countdown$.next(0); // Countdown kết thúc
      }
    }, 1000);
  }

  // Lấy dữ liệu countdown dưới dạng Observable
  getCountdownObservable() {
    return this.countdown$.asObservable();
  }
}

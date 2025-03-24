import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SeatService } from '../Service/seat.service';
@Injectable({
  providedIn: 'root'
})
export class WebSocketInterceptor {
  constructor(private router: Router, private seatService: SeatService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      const paymentPages = ['/thanh-toan', '/payment-callback', '/orders','booking/:id'];
      localStorage.removeItem('userId')
      localStorage.removeItem('selectedSeats')

      if (!paymentPages.some(page => url.includes(page))) {
        this.seatService.disconnect();
      }
    });
  }
}
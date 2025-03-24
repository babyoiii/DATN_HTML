import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SeatInfo } from '../Models/SeatModel';

@Injectable({
  providedIn: 'root'
})
export class SeatDataService {
  private seatsSubject = new BehaviorSubject<SeatInfo[]>([]);
  private selectedSeatsSubject = new BehaviorSubject<SeatInfo[]>([]);
  private seatCoreSubject = new BehaviorSubject<SeatInfo[]>([]);
  private totalAmountSubject = new BehaviorSubject<number>(0);

  seats$ = this.seatsSubject.asObservable();
  seatCore$ = this.seatCoreSubject.asObservable();
  selectedSeats$ = this.selectedSeatsSubject.asObservable();
  totalAmount$ = this.totalAmountSubject.asObservable();

  setSeats(seats: SeatInfo[]): void {
    this.seatsSubject.next(seats);
  }

  setSelectedSeats(selectedSeats: SeatInfo[]): void {
    this.selectedSeatsSubject.next(selectedSeats);
  }

  setTotalAmount(totalAmount: number): void {
    this.totalAmountSubject.next(totalAmount);
  }
  setSeatCore(seatCore: SeatInfo[]): void {
    this.seatCoreSubject.next(seatCore);
  }
}
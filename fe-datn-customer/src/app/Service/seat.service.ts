import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface SeatInfo {
  id: string;
  row: string;
  number: number;
  type: 'standard' | 'vip' | 'couple' | 'wheelchair';
  price: number;
  status: 'available' | 'selected' | 'booked' | 'unavailable';
  pairSeatId?: string | null;
}

export interface ShowtimeDetail {
  id: string;
  movieId: string;
  movieName: string;
  thumbnail: string;
  duration: number;
  showtime: string;
  theater: string;
  room: string;
  seats: SeatInfo[];
  isLeftSide?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SeatService {
  constructor() { }

  getShowtimeDetail(showtimeId: string): Observable<ShowtimeDetail> {
    // Giả lập dữ liệu cho một suất chiếu cụ thể
    const mockShowtime: ShowtimeDetail = {
      id: showtimeId,
      movieId: "1",
      movieName: "Godzilla x Kong: Đế Chế Mới",
      thumbnail: "https://www.cgv.vn/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/g/d/gdzxkong_digital-main-poster_fb_1_.jpg",
      duration: 115,
      showtime: "19:30 - Thứ 6, 22/03/2024",
      theater: "CGV Vincom Center Bà Triệu",
      room: "Cinema 01",
      seats: this.generateSeats()
    };

    return of(mockShowtime);
  };
  private generateSeats(): SeatInfo[] {
    return [
      { id: 'A1', row: 'A', number: 1, type: 'couple', price: 200, status: 'available', pairSeatId: 'A2' },
      { id: 'A2', row: 'A', number: 2, type: 'couple', price: 200, status: 'available', pairSeatId: 'A1' },
      { id: 'B1', row: 'B', number: 1, type: 'standard', price: 100, status: 'booked', pairSeatId: null },
      { id: 'C1', row: 'C', number: 1, type: 'couple', price: 250, status: 'available', pairSeatId: 'C2' },
      { id: 'C2', row: 'C', number: 2, type: 'couple', price: 250, status: 'available', pairSeatId: 'C1' },
      { id: 'D1', row: 'D', number: 1, type: 'standard', price: 120, status: 'available', pairSeatId: null },
      { id: 'E1', row: 'E', number: 1, type: 'couple', price: 220, status: 'available', pairSeatId: 'E2' },
      { id: 'E2', row: 'E', number: 2, type: 'couple', price: 220, status: 'available', pairSeatId: 'E1' },
    ];

  };

  private getSeatType(row: string, number: number): 'standard' | 'vip' | 'couple' | 'wheelchair' {
    if (row === 'A' || row === 'B') return 'standard';
    if (row === 'C' || row === 'D') return 'vip';
    if (row === 'E' && (number === 1 || number === 2)) return 'wheelchair';
    if (row === 'G' || row === 'H') {
      if (number % 2 === 0) return 'couple';
    }
    return 'standard';
  }

  private getSeatPrice(row: string, number: number): number {
    const type = this.getSeatType(row, number);
    switch (type) {
      case 'vip': return 180000;
      case 'couple': return 160000;
      case 'wheelchair': return 120000;
      default: return 140000;
    }
  }

  private getRandomStatus(): 'available' | 'selected' | 'booked' | 'unavailable' {
    const random = Math.random();
    if (random < 0.7) return 'available';
    if (random < 0.75) return 'selected';
    if (random < 0.9) return 'booked';
    return 'unavailable';
  }

  // API giả lập để đặt ghế
  bookSeats(showtimeId: string, seatIds: string[]): Observable<boolean> {
    // Giả lập thành công 90% trường hợp
    const isSuccess = Math.random() < 0.9;
    return of(isSuccess);
  }
} 
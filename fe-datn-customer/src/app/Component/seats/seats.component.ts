import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DurationFormatPipe } from '../../duration-format.pipe';
import { ActivatedRoute, Router } from '@angular/router';
import { SeatService, SeatInfo, ShowtimeDetail } from '../../Service/seat.service';

@Component({
  selector: 'app-seats',
  standalone: true,
  imports: [CommonModule, DurationFormatPipe],
  templateUrl: './seats.component.html',
  styleUrls: ['./seats.component.css']  // Lưu ý: styleUrls (số nhiều)
})
export class SeatsComponent implements OnInit {
  seats: SeatInfo[] = [];
  movieInfo: ShowtimeDetail | null = null;
  selectedSeats: SeatInfo[] = [];
  totalAmount: number = 0;
  isLoading: boolean = true;
  error: string | null = null;
  rows: string[] = [];
  seatsPerRow: { [key: string]: SeatInfo[] } = {};

  constructor(
    private seatService: SeatService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const showtimeId = params['id'];
      if (showtimeId) {
        this.loadShowtimeDetail(showtimeId);
      } else {
        this.error = 'Không tìm thấy mã suất chiếu';
      }
    });
  }

  loadShowtimeDetail(showtimeId: string) {
    this.isLoading = true;
    this.error = null;
  
    this.seatService.getShowtimeDetail(showtimeId).subscribe({
      next: (data) => {
        this.movieInfo = data;
        this.seats = this.filterDuplicateSeats(data.seats); // Lọc ghế trùng lặp
        console.log('Danh sách ghế sau khi lọc:', this.seats);
        this.organizeSeatsByRow();
        this.isLoading = false;
  
        console.log('Thông tin suất chiếu:', this.movieInfo);
      },
      error: (err) => {
        this.error = 'Có lỗi xảy ra khi tải thông tin suất chiếu';
        this.isLoading = false;
        console.error('Lỗi khi tải suất chiếu:', err);
      }
    });
  }
  
  // Hàm loại bỏ cặp ghế trùng lặp
  private filterDuplicateSeats(seats: SeatInfo[]): SeatInfo[] {
    const displayedSeats = new Set<string>();
    return seats.filter(seat => {
      if (!seat.pairSeatId) {
        return true; // Giữ nguyên ghế đơn
      }
  
      const seatPairKey = [seat.id, seat.pairSeatId].sort().join('-'); // Định dạng chuẩn
      if (displayedSeats.has(seatPairKey)) {
        return false; // Nếu cặp đã tồn tại, bỏ qua
      }
  
      displayedSeats.add(seatPairKey);
      return true; // Nếu chưa có, giữ lại ghế đôi
    });
  }
  

  // Tổ chức ghế theo hàng và cột
  organizeSeatsByRow() {
    // Reset dữ liệu
    this.seatsPerRow = {};
    
    // Nhóm ghế theo hàng
    this.seats.forEach(seat => {
      if (!this.seatsPerRow[seat.row]) {
        this.seatsPerRow[seat.row] = [];
      }
      
      // Nếu là ghế đôi, đảm bảo ghế được đặt cạnh nhau
      if (seat.pairSeatId) {
        const pairedSeat = this.findPairedSeat(seat);
        if (pairedSeat) {
          // Thêm cả cặp ghế vào mảng
          const seatPair = [seat, pairedSeat].sort((a, b) => a.number - b.number);
          // Chỉ thêm nếu chưa có trong hàng
          if (!this.seatsPerRow[seat.row].some(s => s.id === seat.id || s.id === pairedSeat.id)) {
            this.seatsPerRow[seat.row].push(...seatPair);
          }
        }
      } else {
        // Với ghế đơn, thêm trực tiếp vào hàng
        if (!this.seatsPerRow[seat.row].some(s => s.id === seat.id)) {
          this.seatsPerRow[seat.row].push(seat);
        }
      }
    });

    // Sắp xếp ghế trong mỗi hàng theo số thứ tự
    Object.keys(this.seatsPerRow).forEach(row => {
      this.seatsPerRow[row].sort((a, b) => a.number - b.number);
    });

    // Cập nhật danh sách hàng và sắp xếp theo thứ tự
    this.rows = Object.keys(this.seatsPerRow).sort();
  }

  getSeatsInRow(row: string): SeatInfo[] {
    return this.seatsPerRow[row] || [];
  }

  selectSeat(seat: SeatInfo): void {
    if (seat.status === 'available') {
      seat.status = 'selected';
      this.selectedSeats.push(seat);
    } else if (seat.status === 'selected') {
      seat.status = 'available';
      this.selectedSeats = this.selectedSeats.filter(s => s.id !== seat.id);
    }
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalAmount = this.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }

  // Các hàm trả về class dựa trên trạng thái, kiểu ghế…
  getSeatStatusClass(status: string): string {
    switch(status) {
      case 'available': return 'bg-white text-black hover:bg-blue-200';
      case 'selected': return 'bg-blue-500 text-white';
      case 'booked': return 'bg-red-500 text-white cursor-not-allowed';
      case 'unavailable': return 'bg-gray-800 text-gray-500 cursor-not-allowed';
      default: return '';
    }
  }

  getSeatTypeClass(type: string): string {
    switch(type) {
      case 'vip': return 'border-2 border-yellow-500';
      case 'couple': return 'border-2 border-pink-500';
      case 'wheelchair': return 'border-2 border-blue-500';
      default: return 'border border-gray-300';
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }

  getColumnCount(): number {
    let maxCount = 0;
    this.rows.forEach(row => {
      const seatsInRow = this.getSeatsInRow(row);
      let count = 0;
      seatsInRow.forEach(seat => {
        count += (seat.type === 'couple') ? 2 : 1;
      });
      if (count > maxCount) {
        maxCount = count;
      }
    });
    return maxCount;
  }

  getSeatFillClass(seat: SeatInfo): string {
    switch(seat.status) {
      case 'available': return '' ;
      case 'selected': return `fill-red-500`;
      case 'booked': return `fill-gray-200 `;
      case 'unavailable': return `cursor-not-allowed invisible`;
      default: return '';
    }
  }

  // Tìm ghế đôi tương ứng
  findPairedSeat(seat: SeatInfo): SeatInfo | null {
    if (!seat || !seat.pairSeatId) return null;
    return this.seats.find(s => s.id === seat.pairSeatId) || null;
  }

  proceedToCheckout() {
    if (this.selectedSeats.length === 0 || !this.movieInfo) return;

    this.seatService.bookSeats(
      this.movieInfo.id,
      this.selectedSeats.map(seat => seat.id)
    ).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/payment'], {
            state: {
              showtimeId: this.movieInfo?.id,
              selectedSeats: this.selectedSeats,
              totalAmount: this.totalAmount
            }
          });
        } else {
          this.error = 'Không thể đặt ghế. Vui lòng thử lại.';
        }
      },
      error: (err) => {
        this.error = 'Có lỗi xảy ra khi đặt ghế';
        console.error('Error booking seats:', err);
      }
    });
  }
}
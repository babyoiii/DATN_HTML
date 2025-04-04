import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SeatService } from '../../Service/seat.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrdersService } from '../../Service/Orders.Service';
import { Service } from '../../Models/Order';
import { ServiceService } from '../../Service/Service.service';
import { GetServiceType } from '../../Models/Service';
import { ModalService } from '../../Service/modal.service';
import { AuthServiceService } from '../../Service/auth-service.service';
import { Subscription } from 'rxjs';

interface Seat {
  seatId: string;
  seatName: string;
  price: number;
  SeatTypeName: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  countdown: string | null = null;
  seatSummary: { [key: string]: { count: number; total: number } } = {};
  selectedServices: { service: Service; quantity: number }[] = [];  
  listServiceTypes : GetServiceType[] = [];
  accordionStates: boolean[] = [];
  isLoggedIn: boolean = false;
  private subscription!: Subscription;
  constructor(
    private seatService: SeatService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private orderService: OrdersService,
    private serviceService: ServiceService,
    private modalService: ModalService,
    private authServiceService: AuthServiceService
  ) {}

  ngOnInit(): void {
    this.getListServiceType();
    this.subscription = this.authServiceService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      console.log('Login status from BehaviorSubject:', status);
    });
    this.seatService.getJoinRoomMessages().subscribe({
      next: (count) => {
        if (count !== null) {
          const minutes = Math.floor(count / 60);
          const seconds = count % 60;
          this.countdown = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          this.cdr.markForCheck();
          if (count === 0) {
            this.notifyAndRedirect();
          }
        }
      },
      error: (err) => console.error('❌ Lỗi khi nhận countdown:', err)
    });

    const data = localStorage.getItem('selectedSeats');
    console.log(data,'dataTuSeat');
    
    if (data) {
      try {
          const seats: Seat[] = JSON.parse(data);
  
          this.seatSummary = seats.reduce((summary, seat) => {
              if (!summary[seat.SeatTypeName]) {
                  summary[seat.SeatTypeName] = { count: 0, total: 0, seatIds: [] };
              }
              summary[seat.SeatTypeName].count++;
              summary[seat.SeatTypeName].total += seat.price;
              summary[seat.SeatTypeName].seatIds.push(seat.seatId); 
  
              return summary;
          }, {} as { [key: string]: { count: number; total: number; seatIds: string[] } });
  
          console.log('📊 Thống kê số lượng, tổng tiền và seatIds:', this.seatSummary);
      } catch (error) {
          console.error('❌ Dữ liệu ghế không hợp lệ:', error);
      }
  }
  }
  checkLogin(): boolean {
    const logged = this.authServiceService.isLoggedIn();
    return logged;
  }
  openSignIn() {
    this.modalService.openSignInModal();
  }
  selectService(service: Service): void {
    console.log('Selected service:', service);
  }
  getListServiceType(): void {
    this.serviceService.getAllServiceTypes(1, 11).subscribe({
      next: (res: any) => {
        console.log('✅ Danh sách loại dịch vụ:', res.data);
        this.listServiceTypes = res.data;
        this.accordionStates = new Array(res.data.length).fill(false); 
      },
      error: (err) => {
        console.error('❌ Lỗi khi lấy danh sách loại dịch vụ:', err);
      },
    });
  }

  toggleAccordion(index: number): void {
    this.accordionStates[index] = !this.accordionStates[index]; 
  }

  private notifyAndRedirect(): void {
    alert('Thời gian giữ ghế đã hết, bạn sẽ được chuyển hướng.');
    this.router.navigate(['/']); 
  }
  getTotalAmount(): number {
    const totalSeatsAmount = Object.values(this.seatSummary).reduce(
      (sum, seat) => sum + seat.total,
      0
    );
  
    const totalServiceAmount = this.selectedServices.reduce(
      (sum, item) => sum + item.service.price * item.quantity,
      0
    );
  
    const subtotal = totalSeatsAmount + totalServiceAmount;
  
    return subtotal; 
  }
  
  getTotalTicketPrice(): number {
    return Object.values(this.seatSummary).reduce(
      (sum, ticket) => sum + ticket.total,
      0
    );
  }
  getTotalService(): number {
    return this.selectedServices.reduce((total, item) => {
      return total + (item.service.price * item.quantity);
    }, 0);
  }
  
  
  getSeatNamesByType(type: string): string {
    const data = localStorage.getItem('selectedSeats');
    if (data) {
      const seats: Seat[] = JSON.parse(data);
      return seats
        .filter(seat => seat.SeatTypeName === type)
        .map(seat => seat.seatName)
        .join(', ');
    }
    return 'Không có ghế';
  }

  goBackToSeats(): void {
    const showtimeId = localStorage.getItem('currentShowtimeId');
    if (showtimeId) {
      sessionStorage.setItem('reloadOnce', 'true'); // Đánh dấu cần reload
      this.router.navigate(['/booking/', showtimeId], {
        state: {
          seats: this.seatSummary,
          selectedSeats: this.selectedServices,
          totalAmount: this.getTotalAmount()
        }
      });
    } else {
      this.router.navigate(['/showtimes'], { queryParams: { reload: 'true' } });
    }
  }
  addService(service: any): void {
    const existingService = this.selectedServices.find(s => s.service.id === service.id);

    if (existingService) {
      existingService.quantity++;
    } else {
      this.selectedServices.push({ service, quantity: 1 });
    }

    console.log('✅ Dịch vụ đã chọn:', this.selectedServices);
  }

  removeService(service: Service): void {
    const existingService = this.selectedServices.find(s => s.service.id === service.id);

    if (existingService) {
      if (existingService.quantity > 1) {
        existingService.quantity--;
      } else {
        this.selectedServices = this.selectedServices.filter(s => s.service.id !== service.id);
      }
    }

    console.log('✅ Dịch vụ sau khi xóa:', this.selectedServices);
  }
  continue(): void {
    console.log(this.seatSummary, 'dataSeatOrder');
  
    const orderData = {
      seats: Object.entries(this.seatSummary).map(([type, data]: any) => ({
        type,
        count: data.count,
        total: data.total,
        seatIds: data.seatIds || []
      })),
      services: this.selectedServices.map(item => ({
        id: item.service.id,
        name: item.service.serviceName,
        price: item.service.price,
        quantity: item.quantity
      })),
      totalAmount: this.getTotalAmount(),
      totalTicketPrice: this.getTotalTicketPrice(),
      totalServiceAmount: this.getTotalService(),
    };
  
    localStorage.setItem('orderData', JSON.stringify(orderData));
    this.router.navigate(['/thanh-toan'], { state: { seats: this.seatSummary, selectedSeats: this.selectedServices, totalAmount: this.getTotalAmount() } });
    console.log('✅ Dữ liệu đã lưu:', orderData);
  }
}
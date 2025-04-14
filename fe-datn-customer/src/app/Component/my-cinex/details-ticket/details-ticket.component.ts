import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OrdersService } from '../../../Service/Orders.Service';
import { GroupedServiceInfo, OrderDetailLanding, ServiceInfoRes } from '../../../Models/Order';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-details-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details-ticket.component.html',
  styleUrls: ['./details-ticket.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DetailsTicketComponent implements OnInit {
  orderDetailData: OrderDetailLanding = {
    id: '',
    movieName: '',
    duration: '',
    orderCode: '',
    orderCodeB64: '',
    description: '',
    cinemaName: '',
    thumbnail: '',
    address: '',
    sessionTime: '',
    sessionDate: '',
    roomName: '',
    seatList: [],
    serviceList: [],
    concessionAmount: 0,
    totalPrice: 0,
    discountPrice: 0,
    PointChange: 0,
    totalPriceTicket: 0,
    email: '',
    createdDate: '',
  };
  groupedServices: GroupedServiceInfo[] = [];
  orderId: string | null = null;
  count: number = 0; 
  orderCode: string = '1CD23F81';
  
  constructor(
    private orderService: OrdersService, 
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id');
    console.log('Order ID:', this.orderId);
    if (this.orderId) {
      this.getOrderDetails(this.orderId);
    }
  }

  getOrderDetails(orderId: string): void {
    this.orderService.getOrderDetailLangding(orderId).subscribe({
      next: (response) => {
        this.orderDetailData = response.data;
        console.log('Order Detail Data:', this.orderDetailData);
        this.count = this.orderDetailData.seatList.length;
        this.groupedServices = this.groupServicesByType(this.orderDetailData.serviceList);
        this.cdr.detectChanges();
        console.log('Grouped Services:', this.groupedServices);
      },
      error: (error) => {
        console.error('Error fetching order details:', error);
      }
    });
  }

  getFormattedSeats(): string {
    if (this.orderDetailData && this.orderDetailData.seatList) {
      return this.orderDetailData.seatList.join(', ');
    }
    return 'Không có ghế';
  }
  
  groupServicesByType(serviceList: ServiceInfoRes[]): GroupedServiceInfo[] {
    const groupedServices: { [key: string]: ServiceInfoRes[] } = {};

    serviceList.forEach((service) => {
      if (!groupedServices[service.serviceTypeName]) {
        groupedServices[service.serviceTypeName] = [];
      }
      groupedServices[service.serviceTypeName].push({
        name: service.name,
        quantity: service.quantity,
        totalPrice: Number(service.totalPrice),
        serviceTypeName: service.serviceTypeName,
      });
    });

    return Object.keys(groupedServices).map((key) => ({
      serviceTypeName: key,
      services: groupedServices[key],
    }));
  }
}
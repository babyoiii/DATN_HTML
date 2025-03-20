export interface Service {
    id: string;
    imageUrl: string;
    serviceName: string;
    description: string;
    price: number;
    categoryName: string;
  }
  

  export interface ServiceReq {
    serviceId: string;
    quantity: number;
  }
  
  export interface TicketReq {
    seatByShowTimeId: string;
  }
  
  export interface OrderModelReq {
    email: string;
    isAnonymous: number;
    paymentId: string;
    services: ServiceReq[];
    tickets: TicketReq[];
  }
  
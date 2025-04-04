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
    userId : string;
    isAnonymous: number;
    paymentId: string;
    transactionCode : string;
    services: ServiceReq[];
    tickets: TicketReq[];
  }
  
  export interface PaymentModelReq {
    amount: number;
    orderDesc: string;
    createdDate: string;
    status: string;
    paymentTranId: number;
    bankCode: string;
    payStatus: string;
    orderInfo: string; 
  }
  export interface PaymentMethod {
    id: string;
    paymentMethodName: string;
    status: number;
    logoUrl: string;
  }
  
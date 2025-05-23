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
    type : number;
    totalPrice: number;
    email: string;
    userId : string | null;
    isAnonymous: number;
    paymentId: string | null;
    transactionCode : string;
    voucherCode : string;
    pointUse : number;
    totalDiscount : number;
    totalPriceMethod : string;
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
  export interface GetListHistoryOrderByUser {
    id: string;
    userName: string;
    movieName: string;
    orderCode: string;
    cinemaName: string;
    address: string;
    thumbnail: string;
    sessionTime: string;
    sessionDate: string;
    roomName: string;
    seatList: string[];
    serviceList: ServiceInfoModel[];
    concessionAmount: number;
    totalPrice: number;
    email: string;
    status: number;
    createdDate: string;
}

export interface ServiceInfoModel {
    name: string;
    quantity: number;
    totalPrice: number;
}
export interface OrderDetailLanding {
  id: string;
  movieName: string;
  duration: string;
  orderCode: string;
  orderCodeB64: string;
  description: string;
  cinemaName: string;
  thumbnail: string;
  address: string;
  sessionTime: string;
  sessionDate: string;
  roomName: string;
  seatList: string[];
  serviceList: ServiceInfoRes[];
  concessionAmount: number;
  totalPrice: number;
  discountPrice: number;
  PointChange: number;
  totalPriceTicket: number;
  email: string;
  createdDate: string;
}
export interface ServiceInfoRes {
  serviceTypeName : string;
  name: string;
  quantity: number;
  totalPrice: number;
}
export interface GroupedServiceInfo {
  serviceTypeName: string;
  services: ServiceInfoModel[];
}
export interface CinemaByLocation {
  id: string; // ID của rạp chiếu phim
  name: string; // Tên rạp chiếu phim
  location: string; // Địa chỉ của rạp chiếu phim
  mapLink?: string; // Liên kết bản đồ của rạp chiếu phim (tùy chọn)
}
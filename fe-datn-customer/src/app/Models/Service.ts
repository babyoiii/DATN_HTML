export interface ServiceList {
    id: string;
    serviceTypeID: string;
    imageUrl: string;
    serviceName: string;
    description: string;
    price: number;
    status: number;
  }
  
  export interface GetServiceType {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    serviceList: ServiceList[];
  }
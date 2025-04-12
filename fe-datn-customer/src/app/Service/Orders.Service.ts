import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { GetListHistoryOrderByUser, OrderModelReq, PaymentMethod, PaymentModelReq, Service } from '../Models/Order';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { get } from 'node:http';

export interface PriceResponse {
  'usd-coin': {
    usd: number;
  };
}

export interface UsdcPriceResponse {
  'usd-coin': {
    usd: number;
  };
}

export interface ExchangeRateResponse {
  rates: {
    VND: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private baseUrl = environment.baseUrl;
  private usdcPriceUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd';
  private exchangeRateUrl = 'https://api.exchangerate-api.com/v4/latest/USD';

  constructor(private router: Router, private http: HttpClient) {}

  // Lấy danh sách dịch vụ (Movies) theo phân trang
  getMovies(currentPage: number, recordPerPage: number): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/Movie/GetService?currentPage=${currentPage}&recordPerPage=${recordPerPage}`);
  }

  // Tạo đơn hàng
  createOrder(orderData: OrderModelReq): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Movie/CreateOrder`, orderData);
  }

  // Tạo thanh toán
  createPayment(orderData: PaymentModelReq): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.baseUrl}/Movie/create-payment`, orderData);
  }

  // Lấy danh sách phương thức thanh toán
  getPaymentMethod(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.baseUrl}/Movie/GetPayment`);
  }

  // Lấy giá USDC theo USD từ CoinGecko
  getUSDCPriceUSD(): Observable<number> {
    return this.http.get<UsdcPriceResponse>(this.usdcPriceUrl)
      .pipe(map(response => response['usd-coin'].usd));
  }

  // Lấy tỉ giá chuyển đổi USD sang VND
  getUSDtoVNDRate(): Observable<number> {
    return this.http.get<ExchangeRateResponse>(this.exchangeRateUrl)
      .pipe(map(response => response.rates.VND));
  }

  // Tính giá USDC theo VND (1 USDC = ? VND)
  getUSDCPriceVND(): Observable<number> {
    return combineLatest([this.getUSDCPriceUSD(), this.getUSDtoVNDRate()]).pipe(
      map(([usdcPriceUSD, usdToVndRate]) => usdcPriceUSD * usdToVndRate)
    );
  }
 getListHistoryOrderByUser(): Observable<any> {
    return this.http.get<GetListHistoryOrderByUser>(`${this.baseUrl}/Movie/GetListHistoryOrderByUser`);
  }
  getPastShowTimesByTimeFilter(filter:string): Observable<any> {
    return this.http.get<GetListHistoryOrderByUser>(`${this.baseUrl}/Movie/GetPastShowTimesByTimeFilter?filter=${filter}`);
  }
 }

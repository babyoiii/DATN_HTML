import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { OrderModelReq, PaymentModelReq, Service } from '../Models/Order';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    private baseUrl = environment.baseUrl;
    constructor(private router: Router, private http: HttpClient) { }
    getMovies(currentPage: number, recordPerPage: number) {
        return this.http.get<Service[]>(`${this.baseUrl}/Movie/GetService?currentPage=${currentPage}&recordPerPage=${recordPerPage}`);
    }
    createOrder(orderData: OrderModelReq): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Movie/CreateOrder`, orderData)
    }
    createPayment(orderData: PaymentModelReq): Observable<PaymentResponse> {
        return this.http.post<any>(`${this.baseUrl}/Movie/create-payment`, orderData);
    }
}
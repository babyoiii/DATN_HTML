import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetServiceType } from '../Models/Service';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private baseUrl = environment.baseUrl;
    constructor(private http: HttpClient) {}

  
  getAllServiceTypes(currentPage: number, recordPerPage: number): Observable<GetServiceType[]> {
    return this.http.get<GetServiceType[]>(`${this.baseUrl}/Movie/GetServiceTypeList?currentPage=${currentPage}&recordPerPage=${recordPerPage}`);
  }
}
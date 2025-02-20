import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private baseUrl = environment.baseUrlLocation;
  constructor(private http : HttpClient) { }
  getProvinces(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/1/0.htm`);
  }
  getDistricts(provinceId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/2/${provinceId}.htm`);
  }
  getWards(districtId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/3/${districtId}.htm`);
  }
}

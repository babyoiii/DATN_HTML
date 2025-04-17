import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CheckMembership, MembershipData, MembershipPreview, PointHistory, RewardPointData } from '../Models/Membership';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MembershipService {
  private baseUrl = environment.baseUrl;
  constructor(private router: Router, private http: HttpClient) { }
   checkMembership(): Observable<any> {
      return this.http.get<CheckMembership>(`${this.baseUrl}/Membership/CheckMembership`);
    }
    getPriceMembershipPreview(orderPrice: number, ticketPrice: number): Observable<MembershipPreview> {
      return this.http.get<MembershipPreview>(`${this.baseUrl}/Membership/MembershipPreview?orderPrice=${orderPrice}&ticketPrice=${ticketPrice}`);
    }
    getMembershipByUserRes(): Observable<any> {
      return this.http.get<MembershipData>(`${this.baseUrl}/Membership/GetmembershipByUserRes`);
    }
    addUserMembership(payload: { membershipId: number; paymentMethodId: string }): Observable<any> {
      const url = `${this.baseUrl}/Membership/AddUserMembership`;
      return this.http.post<any>(url, payload);
    }
    getPointByUser(): Observable<RewardPointData> {
      const url = `${this.baseUrl}/Membership/GetPointByUser`;
      return this.http.get<RewardPointData>(url);
    }
    getPointHistory(type: number, currentPage: number, recordPerPage: number): Observable<PointHistory> {
      const url = `${this.baseUrl}/Membership/GetPointHistory?type=${type}&currentPage=${currentPage}&recordPerPage=${recordPerPage}`;
      return this.http.get<PointHistory>(url);
    }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VoucherUIResponse } from '../Models/voucher-ui.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VoucherUIService {
  private apiUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getVoucherList(currentPage: number = 1, recordPerPage: number = 10): Observable<VoucherUIResponse> {
    return this.http.get<VoucherUIResponse>(
      `${this.apiUrl}/VoucherUI/GetList?currentPage=${currentPage}&recordPerPage=${recordPerPage}`
    );
  }

  /**
   * Gọi API để nhận voucher
   * @param voucherId ID của voucher
   * @param userId ID của người dùng
   * @param quantity Số lượng voucher muốn nhận (mặc định là 1)
   * @returns Observable chứa kết quả nhận voucher
   */
  claimVoucher(voucherId: string, userId: string, quantity: number = 1): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/UserVoucher/ClaimVoucher`, {
      voucherId: voucherId,
      userId: userId,
      quantity: quantity
    });
  }
}

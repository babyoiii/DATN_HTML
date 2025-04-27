import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserVoucherResponse } from '../Models/Voucher';

@Injectable({
  providedIn: 'root'
})
export class UserVoucherService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách voucher của người dùng
   * @param userId ID của người dùng
   * @param currentPage Trang hiện tại
   * @param recordPerPage Số bản ghi mỗi trang
   * @returns Observable chứa danh sách voucher
   */
  getUserVouchers(currentPage: number = 1, recordPerPage: number = 100): Observable<UserVoucherResponse> {
    return this.http.get<UserVoucherResponse>(
      `${this.baseUrl}/UserVoucher/GetUserVouchers?currentPage=${currentPage}&recordPerPage=${recordPerPage}`
    );
  }

  /**
   * Kiểm tra tính khả dụng của voucher
   * @param userId ID của người dùng
   * @param voucherCode Mã voucher
   * @returns Observable chứa kết quả kiểm tra
   */
  checkVoucherAvailability(voucherCode: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/UserVoucher/CheckVoucherAvailability`, {
      voucherCode: voucherCode
    });
  }

  /**
   * Nhận voucher
   * @param voucherId ID của voucher
   * @param userId ID của người dùng
   * @param quantity Số lượng voucher muốn nhận
   * @returns Observable chứa kết quả nhận voucher
   */
  claimVoucher(voucherId: string, userId: string, quantity: number = 1): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/UserVoucher/ClaimVoucher`, {
      voucherId: voucherId,
      userId: userId,
      quantity: quantity
    });
  }
}

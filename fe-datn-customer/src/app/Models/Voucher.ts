export interface UserVoucher {
  id: string;
  voucherId: string;
  userId: string;
  claimedAt: string;
  expiryDate: string;
  status: number; // 0: Available, 1: Used, 2: Expired, 3: Canceled
  quantity: number;
  usedQuantity: number;
  remainingQuantity: number;
  voucherCode: string;
  voucherDescription: string;
  voucherType : number; 
  discountType: string; // PERCENT, FIXED
  discountValue: number;
  minOrderValue: number;
}

export interface UserVoucherResponse {
  responseCode: number;
  message: string;
  data: UserVoucher[];
  totalRecord: number;
}

export interface VoucherAvailabilityResponse {
  responseCode: number;
  message: string;
  data: string;
}

export interface ClaimVoucherResponse {
  responseCode: number;
  message: string;
  data: string;
}


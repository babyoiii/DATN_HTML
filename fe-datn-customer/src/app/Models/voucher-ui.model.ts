export interface VoucherUIResponse {
  responseCode: number;
  message: string;
  data: VoucherUI[];
  totalRecord: number;
}

export interface VoucherUI {
  id: string;
  voucherId: string;
  title: string;
  content: string;
  imageUrl: string;
  displayOrder: number;
  startTime: string;
  endTime: string;
  status: number;
  createdAt: string;
  updatedAt: string | null;
  voucherCode: string;
  voucherDescription: string;
  discountType: string;
  discountValue: number;
  maxUsage: number;
  usedCount: number;
  claimedCount: number;
  maxClaimCount: number;
  isStackable: boolean;
}

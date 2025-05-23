export interface CheckMembership {
    isMemberShip : boolean;
}
export interface MembershipPreview {
    discountAmount: number;
    pointWillEarn: number;
    freeService: string;
}
export interface UserMembershipDetails {
    userName: string;
    memberCode: string;
    memberCodeBase64: string;
    membershipName: string;
    membershipPrice: number;
    membershipPriceNext: number;
    purchasedAt: string; 
    expiryDate: string;
    membershipLevel: number;
  }
  
  export interface MembershipBenefit {
    membershipId: number;
    membershipName: string;
    membershipLevel: number;
    benefitId: number;
    benefitDescription: string;
    logoUrl: string;
    isCurrentLevelBenefit: boolean | null; 
    isNextLevelBenefit: boolean | null; 
    membershipPriceNext?: number;
  }
  
  export interface MembershipData {
    userMembershipDetails: UserMembershipDetails;
    currentLevelBenefits: MembershipBenefit[];
    nextLevelBenefits: MembershipBenefit[];
  }
  export interface RewardPointData {
    totalPoint: number;
    pointRate: number;  
    rewardPoint: number;
  }
  export interface PointHistory {
    reason: string;      
    pointChange: number;  
    createdDate: string; 
  }
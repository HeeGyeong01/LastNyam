// 거래 내역 공통 타입
/**
 * 거래 내역의 메뉴 정보
 */
export interface TransactionMenu {
  menuName: string;
  price: number;
  quantity: number;
}

/**
 * 거래 내역의 가게 정보
 */
export interface TransactionShop {
  shopName: string;
  shopBanner: string;
  openTime: string;
}

/**
 * 거래 상태
 */
export type TransactionStatus =
  | 'PENDING_APPROVAL'
  | 'REJECTED'
  | 'PREPARING_FOOD'
  | 'WAITING_PICKUP'
  | 'COMPLETED_PICKUP'
  | 'NO_SHOW';

/**
 * 거래 내역 기본 구조
 */
export interface BaseTransaction {
  transactionId: number;
  shop: TransactionShop;
  menus: TransactionMenu[];
  totalAmount: number;
  transactionStatus: TransactionStatus;
}

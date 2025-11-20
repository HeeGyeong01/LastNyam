// 푸켓팅 거래 내역 API 응답 타입
import type { BaseTransaction, TransactionMenu, TransactionShop } from './transaction';

/**
 * 푸켓팅 거래 내역의 메뉴 정보
 * @deprecated TransactionMenu를 사용하세요
 */
export type FoocketingTransactionMenu = TransactionMenu;

/**
 * 푸켓팅 거래 내역의 가게 정보
 * @deprecated TransactionShop를 사용하세요
 */
export type FoocketingTransactionShop = TransactionShop;

/**
 * 푸켓팅 거래 내역
 */
export interface FoocketingTransaction extends BaseTransaction {
  foocketingTime: string;
}

/**
 * 푸켓팅 거래 내역 목록
 */
export type FoocketingTransactionList = FoocketingTransaction[];


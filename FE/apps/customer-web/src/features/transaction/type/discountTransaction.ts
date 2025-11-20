// 마감세일 거래 내역 API 응답 타입
import type { BaseTransaction, TransactionMenu, TransactionShop } from './transaction';

/**
 * 마감세일 거래 내역의 메뉴 정보
 * @deprecated TransactionMenu를 사용하세요
 */
export type DiscountTransactionMenu = TransactionMenu;

/**
 * 마감세일 거래 내역의 가게 정보
 * @deprecated TransactionShop를 사용하세요
 */
export type DiscountTransactionShop = TransactionShop;

/**
 * 마감세일 거래 내역
 */
export interface DiscountTransaction extends BaseTransaction {}

/**
 * 마감세일 거래 내역 목록
 */
export type DiscountTransactionList = DiscountTransaction[];


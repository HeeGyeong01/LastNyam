// 마감세일 관련 타입
export type DiscountCategory = 
  | 1
  | 2  
  | 3
  | 4
  | 5;

// 찜하기순, 별점순, 거리순, 할인율순, 가격순
export type DiscountSortType = 'FAVORITES' | 'RATING' | 'CLOSEST' | 'DISCOUNT' | 'PRICE';

// 메뉴 정보
export interface DiscountMenuInfo {
  name: string;
  description: string;
  price: number;
  photoUrl: string;
}

// 가게 정보
export interface DiscountShopInfo {
  shopId: number;
  bannerUrl: string | null;
  name: string;
  lat: number;
  lng: number;
  distance: number;
  rating: number;
  ratingCount: number;
}

// 각각의 마감세일 아이템
export interface DiscountItem {
  discountId: number;
  discountAmount: number;
  discountRate: number;
  discountPrice: number;
  menuInfo: DiscountMenuInfo;
  shopInfo: DiscountShopInfo;
}

// API 응답의 data(마감세일 목록) 부분
export interface DiscountListData {
  content: DiscountItem[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

//////////////////////////////////////////////////////////////
// 마감세일 검색용 메뉴 정보 (description 없음)
export interface DiscountSearchMenuInfo {
  name: string;
  price: number;
  photoUrl: string;
}

// 마감세일 검색 결과 아이템
export interface DiscountSearchItem {
  discountId: number;
  discountAmount: number;
  discountRate: number;
  discountPrice: number;
  menuInfo: DiscountSearchMenuInfo;
  shopInfo: DiscountShopInfo;
}

// 마감세일 검색 결과 데이터 (커서 기반 페이지네이션)
export interface DiscountSearchData {
  content: DiscountSearchItem[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

